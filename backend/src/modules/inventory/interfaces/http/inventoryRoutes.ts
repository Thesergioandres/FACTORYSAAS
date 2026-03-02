import { Router, type Request, type Response } from 'express';
import type { InventoryRepository } from '../../application/ports/InventoryRepository';
import type { CreateProductUseCase } from '../../application/use-cases/createProductUseCase';
import type { RecordSaleUseCase } from '../../application/use-cases/recordSaleUseCase';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';

export function createInventoryRoutes({
  inventoryRepository,
  createProductUseCase,
  recordSaleUseCase,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  inventoryRepository: InventoryRepository;
  createProductUseCase: CreateProductUseCase;
  recordSaleUseCase: RecordSaleUseCase;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

  router.get('/', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const items = await inventoryRepository.list(tenantId);
    res.json(items);
  });

  router.post('/', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const result = await createProductUseCase.execute({
      ...(req.body || {}),
      tenantId
    } as Record<string, unknown>);

    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.status(201).json(result.product);
  });

  router.patch('/:id', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const product = await inventoryRepository.update(req.params.id, (req.body || {}) as Record<string, unknown>);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.json(product);
  });

  router.delete('/:id', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const removed = await inventoryRepository.delete(req.params.id, tenantId);
    if (!removed) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.status(204).send();
  });

  router.post('/sales', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const result = await recordSaleUseCase.execute({
      tenantId,
      items: (req.body as { items?: Array<{ productId: string; quantity: number }> })?.items
    });

    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.json(result);
  });

  return router;
}
