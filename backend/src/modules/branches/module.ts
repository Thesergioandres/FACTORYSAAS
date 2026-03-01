import { InMemoryBranchesRepository } from './infrastructure/persistence/InMemoryBranchesRepository';
import { MongoBranchesRepository } from './infrastructure/persistence/MongoBranchesRepository';
import { createBranchesRoutes } from './interfaces/http/branchesRoutes';
import type { authenticateJwt } from '../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../shared/interfaces/http/middlewares/requireRoles';
import type { createPlanGatekeeper } from '../../shared/interfaces/http/middlewares/planGatekeeper';
import type { BranchesRepository } from './application/ports/BranchesRepository';

export function createBranchesModule({
  useMongo = false,
  branchesRepository: providedBranchesRepository,
  planGatekeeper,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  useMongo?: boolean;
  branchesRepository?: BranchesRepository;
  planGatekeeper?: ReturnType<typeof createPlanGatekeeper>;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const branchesRepository = providedBranchesRepository || (useMongo ? new MongoBranchesRepository() : new InMemoryBranchesRepository());
  const branchesRoutes = createBranchesRoutes({
    branchesRepository,
    planGatekeeper,
    authenticateJwt: authMiddleware,
    requireRoles: requireRolesMiddleware
  });

  return { branchesRoutes, branchesRepository };
}
