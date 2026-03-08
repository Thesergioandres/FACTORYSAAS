import { InMemoryInvoicesRepository } from './infrastructure/persistence/InMemoryInvoicesRepository';
import { MongoInvoicesRepository } from './infrastructure/persistence/MongoInvoicesRepository';
import { TaxCalculatorService } from './application/services/TaxCalculatorService';
import { CreateInvoiceUseCase } from './application/use-cases/CreateInvoiceUseCase';
import { createBillingRoutes } from './interfaces/http/billingRoutes';
import type { authenticateJwt } from '../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../shared/interfaces/http/middlewares/requireRoles';
import type { TenantsRepository } from '../tenants/application/ports/TenantsRepository';

export function createBillingModule({
  useMongo = false,
  tenantsRepository,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  useMongo?: boolean;
  tenantsRepository: TenantsRepository;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const invoicesRepository = useMongo ? new MongoInvoicesRepository() : new InMemoryInvoicesRepository();
  const taxCalculator = new TaxCalculatorService();
  const createInvoiceUseCase = new CreateInvoiceUseCase(invoicesRepository, tenantsRepository, taxCalculator);

  const billingRoutes = createBillingRoutes({
    createInvoiceUseCase,
    authenticateJwt: authMiddleware,
    requireRoles: requireRolesMiddleware
  });

  return { billingRoutes, createInvoiceUseCase };
}
