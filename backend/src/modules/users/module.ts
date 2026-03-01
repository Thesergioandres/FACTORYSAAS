import { InMemoryUsersRepository } from './infrastructure/persistence/InMemoryUsersRepository';
import { MongoUsersRepository } from './infrastructure/persistence/MongoUsersRepository';
import { RegisterClientUseCase } from './application/use-cases/registerClientUseCase';
import { CreateUserByAdminUseCase } from './application/use-cases/createUserByAdminUseCase';
import { RegisterTenantAdminUseCase } from './application/use-cases/registerTenantAdminUseCase';
import { createUsersRoutes } from './interfaces/http/usersRoutes';
import type { authenticateJwt } from '../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../shared/interfaces/http/middlewares/requireRoles';
import type { FactoryService } from '../tenants/application/FactoryService';
import type { createPlanGatekeeper } from '../../shared/interfaces/http/middlewares/planGatekeeper';
import type { UsersRepository } from './application/ports/UsersRepository';

export function createUsersModule({
  useMongo = false,
  usersRepository: providedUsersRepository,
  factoryService,
  planGatekeeper,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  useMongo?: boolean;
  usersRepository?: UsersRepository;
  factoryService?: FactoryService;
  planGatekeeper?: ReturnType<typeof createPlanGatekeeper>;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const usersRepository = providedUsersRepository || (useMongo ? new MongoUsersRepository() : new InMemoryUsersRepository());
  const registerClientUseCase = new RegisterClientUseCase({ usersRepository });
  const createUserByAdminUseCase = new CreateUserByAdminUseCase({ usersRepository });
  const registerTenantAdminUseCase = factoryService
    ? new RegisterTenantAdminUseCase({ factoryService })
    : undefined;

  const usersRoutes = createUsersRoutes({
    registerClientUseCase,
    createUserByAdminUseCase,
    registerTenantAdminUseCase,
    usersRepository,
    planGatekeeper,
    authenticateJwt: authMiddleware,
    requireRoles: requireRolesMiddleware
  });

  return { usersRoutes, usersRepository };
}
