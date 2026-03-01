import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { database } from '../../../../shared/infrastructure/memory/database';
import { WhatsAppLogModel } from '../../../../shared/infrastructure/mongoose/models/WhatsAppLogModel';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';

export function createNotificationsRoutes({
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

  router.get('/logs', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId && req.auth?.role !== 'GOD') {
      return res.status(403).json({ message: 'No tenantId' });
    }

    if (mongoose.connection.readyState === 1) {
      const query = req.auth?.role === 'GOD' ? {} : { tenantId };
      const logs = await WhatsAppLogModel.find(query).sort({ createdAt: -1 }).limit(200).lean();
      return res.json(logs);
    }

    const logs = req.auth?.role === 'GOD'
      ? database.whatsappLogs
      : database.whatsappLogs.filter((log) => (log as { tenantId?: string }).tenantId === tenantId);
    return res.json(logs);
  });

  router.get('/config', authMiddleware, requireRolesMiddleware('ADMIN'), (_req: Request, res: Response) => {
    res.json(database.appConfig);
  });

  router.patch('/config', authMiddleware, requireRolesMiddleware('ADMIN'), (req: Request, res: Response) => {
    const body = (req.body || {}) as Record<string, unknown>;

    if (typeof body.minAdvanceMinutes === 'number') {
      database.appConfig.minAdvanceMinutes = body.minAdvanceMinutes;
    }

    if (typeof body.cancelLimitMinutes === 'number') {
      database.appConfig.cancelLimitMinutes = body.cancelLimitMinutes;
    }

    if (typeof body.rescheduleLimitMinutes === 'number') {
      database.appConfig.rescheduleLimitMinutes = body.rescheduleLimitMinutes;
    }

    if (typeof body.quietHoursStart === 'string') {
      database.appConfig.quietHoursStart = body.quietHoursStart;
    }

    if (typeof body.quietHoursEnd === 'string') {
      database.appConfig.quietHoursEnd = body.quietHoursEnd;
    }

    if (Array.isArray(body.reminderMinutes)) {
      database.appConfig.reminderMinutes = body.reminderMinutes
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0);
    }

    if (typeof body.whatsappDebounceSeconds === 'number' && body.whatsappDebounceSeconds >= 0) {
      database.appConfig.whatsappDebounceSeconds = body.whatsappDebounceSeconds;
    }

    if (body.whatsappEnabledEvents && typeof body.whatsappEnabledEvents === 'object') {
      database.appConfig.whatsappEnabledEvents = {
        ...database.appConfig.whatsappEnabledEvents,
        ...(body.whatsappEnabledEvents as Record<string, boolean>)
      };
    }

    if (body.whatsappTemplates && typeof body.whatsappTemplates === 'object') {
      database.appConfig.whatsappTemplates = {
        ...database.appConfig.whatsappTemplates,
        ...(body.whatsappTemplates as Record<string, string>)
      };
    }

    return res.json(database.appConfig);
  });

  return router;
}
