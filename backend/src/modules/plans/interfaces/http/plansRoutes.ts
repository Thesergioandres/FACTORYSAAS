import { Router, type Request, type Response } from 'express';
import type { PlansRepository } from '../../application/ports/PlansRepository';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';

export function createPlansRoutes({
  plansRepository,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  plansRepository: PlansRepository;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

  router.get('/', authMiddleware, requireRolesMiddleware('GOD'), async (_req: Request, res: Response) => {
    const plans = await plansRepository.listAll();
    res.json(plans);
  });

  router.patch('/:id', authMiddleware, requireRolesMiddleware('GOD'), async (req: Request, res: Response) => {
    const payload = (req.body || {}) as {
      price?: number;
      maxBranches?: number;
      maxStaff?: number;
      maxMonthlyAppointments?: number;
      features?: string[];
    };

    const updated = await plansRepository.update(req.params.id, payload);
    if (!updated) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }

    return res.json(updated);
  });

  return router;
}
