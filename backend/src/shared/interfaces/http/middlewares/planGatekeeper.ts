import type { Request, Response, NextFunction } from 'express';
import type { TenantsRepository } from '../../../../modules/tenants/application/ports/TenantsRepository';
import type { PlansRepository } from '../../../../modules/plans/application/ports/PlansRepository';
import type { UsersRepository } from '../../../../modules/users/application/ports/UsersRepository';
import type { BranchesRepository } from '../../../../modules/branches/application/ports/BranchesRepository';

const LIMIT_MESSAGE = 'Has alcanzado el límite de tu plan. Actualiza a Pro para continuar';

export function createPlanGatekeeper({
  tenantsRepository,
  plansRepository,
  usersRepository,
  branchesRepository
}: {
  tenantsRepository: TenantsRepository;
  plansRepository: PlansRepository;
  usersRepository: UsersRepository;
  branchesRepository: BranchesRepository;
}) {
  const requirePlan = async (tenantId: string) => {
    const tenant = await tenantsRepository.findById(tenantId);
    if (!tenant) return { error: 'Tenant inválido', statusCode: 404 };

    const plan = await plansRepository.findById(tenant.planId);
    if (!plan) return { error: 'Plan no encontrado', statusCode: 500 };

    return { plan };
  };

  const requireStaffSlot = async (req: Request, res: Response, next: NextFunction) => {
    const role = (req.body as { role?: string })?.role;
    if (role !== 'STAFF') {
      return next();
    }

    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const result = await requirePlan(tenantId);
    if ('error' in result) return res.status(result.statusCode ?? 500).json({ message: result.error });

    const staff = await usersRepository.list(tenantId, 'STAFF');
    if (staff.length >= result.plan.maxStaff) {
      return res.status(403).json({ message: LIMIT_MESSAGE });
    }

    return next();
  };

  const requireBranchSlot = async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const result = await requirePlan(tenantId);
    if ('error' in result) return res.status(result.statusCode ?? 500).json({ message: result.error });

    const count = await branchesRepository.countByTenant(tenantId);
    if (count >= result.plan.maxBranches) {
      return res.status(403).json({ message: LIMIT_MESSAGE });
    }

    return next();
  };

  return { requireStaffSlot, requireBranchSlot };
}
