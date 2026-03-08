import { InMemoryPosRepository } from './infrastructure/persistence/InMemoryPosRepository';
import { MongoPosRepository } from './infrastructure/persistence/MongoPosRepository';
import { CreateSaleUseCase } from './application/use-cases/createSaleUseCase';
import { createPosRoutes } from './interfaces/http/posRoutes';
import type { authenticateJwt } from '../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../shared/interfaces/http/middlewares/requireRoles';
import type { AppointmentsRepository } from '../appointments/application/ports/AppointmentsRepository';
import type { ServicesRepository } from '../services/application/ports/ServicesRepository';
import type { UsersRepository } from '../users/application/ports/UsersRepository';
import type { CreateInvoiceUseCase } from '../billing/application/use-cases/CreateInvoiceUseCase';

export function createPosModule({
  useMongo = false,
  appointmentsRepository,
  servicesRepository,
  usersRepository,
  createInvoiceUseCase,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  useMongo?: boolean;
  appointmentsRepository: AppointmentsRepository;
  servicesRepository: ServicesRepository;
  usersRepository: UsersRepository;
  createInvoiceUseCase?: CreateInvoiceUseCase;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const posRepository = useMongo ? new MongoPosRepository() : new InMemoryPosRepository();
  const createSaleUseCase = new CreateSaleUseCase(posRepository);

  const posRoutes = createPosRoutes({
    posRepository,
    createSaleUseCase,
    appointmentsRepository,
    servicesRepository,
    usersRepository,
    createInvoiceUseCase,
    authenticateJwt: authMiddleware,
    requireRoles: requireRolesMiddleware
  });

  return { posRoutes, posRepository };
}
