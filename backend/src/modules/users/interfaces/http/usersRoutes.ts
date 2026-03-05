import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import type { RegisterClientUseCase } from '../../application/use-cases/registerClientUseCase';
import type { CreateUserByAdminUseCase } from '../../application/use-cases/createUserByAdminUseCase';
import type { RegisterTenantAdminUseCase } from '../../application/use-cases/registerTenantAdminUseCase';
import type { createPlanGatekeeper } from '../../../../shared/interfaces/http/middlewares/planGatekeeper';
import type { UsersRepository } from '../../application/ports/UsersRepository';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';

function sanitizeUser(user: { passwordHash?: string }) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function isE164(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export function createUsersRoutes({
  registerClientUseCase,
  createUserByAdminUseCase,
  registerTenantAdminUseCase,
  usersRepository,
  planGatekeeper,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  registerClientUseCase: RegisterClientUseCase;
  createUserByAdminUseCase: CreateUserByAdminUseCase;
  registerTenantAdminUseCase?: RegisterTenantAdminUseCase;
  usersRepository: UsersRepository;
  planGatekeeper?: ReturnType<typeof createPlanGatekeeper>;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();
  const requireStaffSlot = planGatekeeper?.requireStaffSlot || ((_req: Request, _res: Response, next) => next());

  router.get('/public/staff', async (_req: Request, res: Response) => {
    const staff = await usersRepository.list('STAFF');
    const safeStaff = staff
      .filter((member) => member.active !== false && member.approved !== false)
      .map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role
      }));

    res.json(safeStaff);
  });

  router.get('/', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const role = typeof req.query.role === 'string' ? req.query.role : undefined;
    const users = await usersRepository.list(tenantId, role);
    res.json(users.map(sanitizeUser));
  });

  router.get('/pending', authMiddleware, requireRolesMiddleware('GOD'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    const users = tenantId
      ? await usersRepository.list(tenantId)
      : await usersRepository.listAll?.() || [];
    const pending = users.filter((user) => user.approved === false);
    res.json(pending.map(sanitizeUser));
  });

  router.post('/register', async (req: Request, res: Response) => {
    const result = await registerClientUseCase.execute((req.body || {}) as Record<string, unknown>);
    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.status(201).json(sanitizeUser(result.user));
  });

  router.post('/register-tenant', async (req: Request, res: Response) => {
    if (!registerTenantAdminUseCase) {
      return res.status(501).json({ message: 'Registro de tenant no soportado' });
    }

    const result = await registerTenantAdminUseCase.execute((req.body || {}) as Record<string, unknown>);
    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.status(201).json({
      tenant: result.tenant,
      branch: result.branch,
      user: sanitizeUser(result.user)
    });
  });

  router.post(
    '/admin',
    authMiddleware,
    requireRolesMiddleware('ADMIN'),
    requireStaffSlot,
    async (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId;
      if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

      const payload = (req.body || {}) as Record<string, unknown>;
      const result = await createUserByAdminUseCase.execute({
        ...(payload as Record<string, unknown>),
        tenantId,
        branchIds: Array.isArray((payload as { branchIds?: string[] }).branchIds)
          ? (payload as { branchIds: string[] }).branchIds
          : undefined
      });
    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.status(201).json(sanitizeUser(result.user));
    }
  );

  router.patch('/:id/whatsapp-consent', authMiddleware, async (req: Request, res: Response) => {
    const requesterId = req.auth?.sub;
    const requesterRole = req.auth?.role;
    const isAdmin = requesterRole === 'ADMIN';

    if (!isAdmin && requesterId !== req.params.id) {
      return res.status(403).json({ message: 'Solo puedes actualizar tu propio consentimiento' });
    }

    const user = await usersRepository.updateWhatsappConsent(req.params.id, Boolean(req.body?.whatsappConsent));
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(sanitizeUser(user));
  });

  router.patch('/me', authMiddleware, async (req: Request, res: Response) => {
    const userId = req.auth?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const payload = (req.body || {}) as {
      name?: string;
      phone?: string;
      whatsappConsent?: boolean;
    };

    if (payload.phone && !isE164(payload.phone)) {
      return res.status(400).json({ message: 'phone debe estar en formato E.164' });
    }

    const updated = await usersRepository.update(userId, {
      name: payload.name,
      phone: payload.phone,
      whatsappConsent: payload.whatsappConsent
    });

    if (!updated) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(sanitizeUser(updated));
  });

  router.patch('/:id', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const payload = (req.body || {}) as {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      active?: boolean;
      whatsappConsent?: boolean;
      password?: string;
      commissionRate?: number;
    };

    if (payload.phone && !isE164(payload.phone)) {
      return res.status(400).json({ message: 'phone debe estar en formato E.164' });
    }

    if (payload.role && !['GOD', 'ADMIN', 'STAFF', 'CLIENT'].includes(payload.role)) {
      return res.status(400).json({ message: 'role inválido' });
    }

    if (payload.role === 'GOD' && req.auth?.role !== 'GOD') {
      return res.status(403).json({ message: 'Solo GOD puede asignar rol GOD' });
    }

    if (payload.commissionRate !== undefined) {
      const rate = Number(payload.commissionRate);
      if (Number.isNaN(rate) || rate < 0 || rate > 1) {
        return res.status(400).json({ message: 'commissionRate debe ser entre 0 y 1' });
      }
    }

    const passwordHash = payload.password ? bcrypt.hashSync(payload.password, 10) : undefined;
    const updated = await usersRepository.update(req.params.id, {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role as 'GOD' | 'ADMIN' | 'STAFF' | 'CLIENT' | undefined,
      active: payload.active,
      whatsappConsent: payload.whatsappConsent,
      passwordHash,
      commissionRate: payload.commissionRate
    });

    if (!updated) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(sanitizeUser(updated));
  });

  router.patch('/:id/approve', authMiddleware, requireRolesMiddleware('GOD'), async (req: Request, res: Response) => {
    const updated = await usersRepository.update(req.params.id, { approved: true });
    if (!updated) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(sanitizeUser(updated));
  });

  return router;
}
