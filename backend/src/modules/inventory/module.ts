import { InMemoryInventoryRepository } from './infrastructure/persistence/InMemoryInventoryRepository';
import { MongoInventoryRepository } from './infrastructure/persistence/MongoInventoryRepository';
import { CreateProductUseCase } from './application/use-cases/createProductUseCase';
import { RecordSaleUseCase } from './application/use-cases/recordSaleUseCase';
import { createInventoryRoutes } from './interfaces/http/inventoryRoutes';
import type { authenticateJwt } from '../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../shared/interfaces/http/middlewares/requireRoles';

export function createInventoryModule({
  useMongo = false,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  useMongo?: boolean;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const inventoryRepository = useMongo ? new MongoInventoryRepository() : new InMemoryInventoryRepository();
  const createProductUseCase = new CreateProductUseCase({ inventoryRepository });
  const recordSaleUseCase = new RecordSaleUseCase({ inventoryRepository });

  const inventoryRoutes = createInventoryRoutes({
    inventoryRepository,
    createProductUseCase,
    recordSaleUseCase,
    authenticateJwt: authMiddleware,
    requireRoles: requireRolesMiddleware
  });

  return { inventoryRoutes, inventoryRepository };
}
