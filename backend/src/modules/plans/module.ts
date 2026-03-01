import { InMemoryPlansRepository } from './infrastructure/persistence/InMemoryPlansRepository';
import { MongoPlansRepository } from './infrastructure/persistence/MongoPlansRepository';
import { createPlansRoutes } from './interfaces/http/plansRoutes';
import type { authenticateJwt } from '../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../shared/interfaces/http/middlewares/requireRoles';

export function createPlansModule({
  useMongo = false,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  useMongo?: boolean;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const plansRepository = useMongo ? new MongoPlansRepository() : new InMemoryPlansRepository();
  const plansRoutes = createPlansRoutes({
    plansRepository,
    authenticateJwt: authMiddleware,
    requireRoles: requireRolesMiddleware
  });

  return { plansRoutes, plansRepository };
}
