import { AddCustomerToTenantUseCase } from './application/use-cases/AddCustomerToTenantUseCase';
import { InMemoryCustomersRepository } from './infrastructure/persistence/InMemoryCustomersRepository';
import { MongoCustomersRepository } from './infrastructure/persistence/MongoCustomersRepository';
import { createCrmRoutes } from './interfaces/http/crmRoutes';
import type { authenticateJwt } from '../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../shared/interfaces/http/middlewares/requireRoles';

export function createCrmModule({
  useMongo = false,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  useMongo?: boolean;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const customersRepository = useMongo ? new MongoCustomersRepository() : new InMemoryCustomersRepository();
  const addCustomerToTenantUseCase = new AddCustomerToTenantUseCase(customersRepository);
  const crmRoutes = createCrmRoutes({
    customersRepository,
    addCustomerToTenantUseCase,
    authenticateJwt: authMiddleware,
    requireRoles: requireRolesMiddleware
  });

  return { crmRoutes, customersRepository };
}
