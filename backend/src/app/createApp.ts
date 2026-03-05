import express, { type Express } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { database } from '../shared/infrastructure/memory/database';
import { authenticateJwt } from '../shared/interfaces/http/middlewares/authenticateJwt';
import { requireRoles } from '../shared/interfaces/http/middlewares/requireRoles';
import { requireApproved } from '../shared/interfaces/http/middlewares/requireApproved';
import { createPlanGatekeeper } from '../shared/interfaces/http/middlewares/planGatekeeper';
import { auditLogger } from '../shared/interfaces/http/middlewares/auditLogger';
import { createAuthModule } from '../modules/auth/module';
import { createUsersModule } from '../modules/users/module';
import { createServicesModule } from '../modules/services/module';
import { createStaffModule } from '../modules/staff/module';
import { InMemoryUsersRepository } from '../modules/users/infrastructure/persistence/InMemoryUsersRepository';
import { MongoUsersRepository } from '../modules/users/infrastructure/persistence/MongoUsersRepository';
import { createTenantsRoutes } from '../modules/tenants/interfaces/http/tenantsRoutes';
import { createTenantsRepository } from '../modules/tenants/module';
import { FactoryService } from '../modules/tenants/application/FactoryService';
import { createPlansModule } from '../modules/plans/module';
import { createBranchesModule } from '../modules/branches/module';
import { InMemoryBranchesRepository } from '../modules/branches/infrastructure/persistence/InMemoryBranchesRepository';
import { MongoBranchesRepository } from '../modules/branches/infrastructure/persistence/MongoBranchesRepository';
import { createNotificationsModule } from '../modules/notifications/module';
import { createAppointmentsModule } from '../modules/appointments/module';
import { createReportsModule } from '../modules/reports/module';
import { createInventoryModule } from '../modules/inventory/module';
import { createUploadRoutes } from '../routes/upload';
import { healthRouter } from '../routes/health';
import type { Env } from '../config/env';
import type { Logger } from 'pino';

export function createApp({
  env,
  logger,
  persistence = { useMongo: false }
}: {
  env: Env;
  logger: Logger;
  persistence?: { useMongo: boolean };
}): Express {
  const app = express();

  if (env.trustProxy) {
    app.set('trust proxy', 1);
  }

  database.appConfig.minAdvanceMinutes = env.minAdvanceMinutes;
  database.appConfig.cancelLimitMinutes = env.cancelLimitMinutes;
  database.appConfig.rescheduleLimitMinutes = env.rescheduleLimitMinutes;
  database.appConfig.quietHoursStart = env.quietHoursStart;
  database.appConfig.quietHoursEnd = env.quietHoursEnd;

  const authMiddleware = authenticateJwt({ jwtSecret: env.jwtSecret });

  const tenantsRepository = createTenantsRepository({ useMongo: persistence.useMongo });

  const { plansRoutes, plansRepository } = createPlansModule({
    useMongo: persistence.useMongo,
    authenticateJwt: authMiddleware,
    requireRoles
  });

  const branchesRepository = persistence.useMongo
    ? new MongoBranchesRepository()
    : new InMemoryBranchesRepository();

  const usersRepository = persistence.useMongo
    ? new MongoUsersRepository()
    : new InMemoryUsersRepository();
  const { servicesRoutes, servicesRepository } = createServicesModule({
    useMongo: persistence.useMongo,
    authenticateJwt: authMiddleware,
    requireRoles
  });
  const { staffRoutes, availabilityRepository } = createStaffModule({
    useMongo: persistence.useMongo,
    authenticateJwt: authMiddleware,
    requireApproved: requireApproved(),
    requireRoles
  });
  const planGatekeeper = createPlanGatekeeper({
    tenantsRepository,
    plansRepository,
    usersRepository,
    branchesRepository
  });

  const { branchesRoutes } = createBranchesModule({
    branchesRepository,
    planGatekeeper,
    authenticateJwt: authMiddleware,
    requireRoles
  });

  const factoryService = new FactoryService({
    tenantsRepository,
    plansRepository,
    branchesRepository,
    usersRepository,
    defaultConfig: {
      ...database.appConfig,
      bufferTimeMinutes: 10,
      requirePaymentForNoShows: false,
      maxNoShowsBeforePayment: 3
    }
  });

  const { usersRoutes: usersRoutesWithFactory } = createUsersModule({
    usersRepository,
    factoryService,
    planGatekeeper,
    authenticateJwt: authMiddleware,
    requireRoles
  });

  const { notificationsService, notificationsRoutes } = createNotificationsModule({
    env,
    authenticateJwt: authMiddleware,
    requireRoles,
    tenantsRepository
  });

  const { inventoryRoutes, inventoryRepository } = createInventoryModule({
    useMongo: persistence.useMongo,
    authenticateJwt: authMiddleware,
    requireRoles
  });

  const { appointmentsRoutes, appointmentsRepository } = createAppointmentsModule({
    tenantsRepository,
    servicesRepository,
    usersRepository,
    availabilityRepository,
    notificationsService,
    useMongo: persistence.useMongo,
    authenticateJwt: authMiddleware,
    requireApproved: requireApproved(),
    requireRoles
  });
  const { reportsRoutes } = createReportsModule({
    usersRepository,
    servicesRepository,
    appointmentsRepository,
    inventoryRepository,
    authenticateJwt: authMiddleware,
    requireRoles
  });
  const { authRoutes } = createAuthModule({ env, usersRepository });

  const { uploadRoutes } = createUploadRoutes({
    authenticateJwt: authMiddleware,
    requireRoles
  });

  const tenantsRoutes = createTenantsRoutes({
    tenantsRepository,
    authenticateJwt: authMiddleware,
    requireRoles
  });

  app.use(helmet());
  app.use(compression());
  app.use(
    pinoHttp({
      logger,
      quietReqLogger: true,
      customSuccessMessage(req, res) {
        return `${req.method} ${req.url} -> ${res.statusCode}`;
      }
    })
  );
  app.use(
    rateLimit({
      windowMs: env.apiRateLimitWindowMs,
      max: env.apiRateLimitMax,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.corsOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error('CORS origin no permitido'));
      },
      credentials: true
    })
  );
  app.use(express.json());
  app.use(auditLogger());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }));

  const swaggerSpec = swaggerJsDoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Factory SaaS API',
        version: '1.0.0'
      }
    },
    apis: []
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api', healthRouter);
  app.use('/api/tenants', tenantsRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutesWithFactory);
  app.use('/api/plans', plansRoutes);
  app.use('/api/branches', branchesRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/staff', staffRoutes);
  app.use('/api/appointments', appointmentsRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/upload', uploadRoutes);

  const publicDir = path.join(process.cwd(), 'public');
  if (env.nodeEnv === 'production' && fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ message: 'Recurso no encontrado' });
  });

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error?.message === 'CORS origin no permitido') {
      return res.status(403).json({ message: error.message });
    }

    logger?.error({ err: error }, 'Unhandled error');
    return res.status(500).json({ message: 'Error interno del servidor' });
  });

  return app;
}
