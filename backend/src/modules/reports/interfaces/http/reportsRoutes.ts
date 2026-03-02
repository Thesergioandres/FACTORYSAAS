import { Router, type Request, type Response } from 'express';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';

export function createReportsRoutes({
  getSummary,
  getDaily,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  getSummary: (tenantId: string) => Promise<Record<string, unknown>>;
  getDaily: (tenantId: string, date?: string) => Promise<Record<string, unknown>>;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

  router.get('/summary', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Forbidden: No tenantId' });
    }
    const summary = await getSummary(tenantId);
    res.json(summary);
  });

  router.get('/daily', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Forbidden: No tenantId' });
    }

    const date = typeof req.query.date === 'string' ? req.query.date : undefined;
    const summary = await getDaily(tenantId, date);
    res.json(summary);
  });

  return router;
}
