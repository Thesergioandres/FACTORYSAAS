import { Router, type Request, type Response } from 'express';
import type { BranchesRepository } from '../../application/ports/BranchesRepository';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';
import type { createPlanGatekeeper } from '../../../../shared/interfaces/http/middlewares/planGatekeeper';

export function createBranchesRoutes({
  branchesRepository,
  planGatekeeper,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  branchesRepository: BranchesRepository;
  planGatekeeper?: ReturnType<typeof createPlanGatekeeper>;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();
  const requireBranchSlot = planGatekeeper?.requireBranchSlot || ((_req: Request, _res: Response, next) => next());

  router.get('/', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const branches = await branchesRepository.listByTenant(tenantId);
    return res.json(branches);
  });

  router.post('/', authMiddleware, requireRolesMiddleware('ADMIN'), requireBranchSlot, async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const payload = (req.body || {}) as { name?: string; address?: string; phone?: string; active?: boolean };
    if (!payload.name || !payload.address) {
      return res.status(400).json({ message: 'name y address son requeridos' });
    }

    const branch = await branchesRepository.create({
      tenantId,
      name: payload.name,
      address: payload.address,
      phone: payload.phone || '',
      active: payload.active ?? true
    });

    return res.status(201).json(branch);
  });

  return router;
}
