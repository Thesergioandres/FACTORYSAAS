import { Router, type Request, type Response } from 'express';
import type { InventoryRepository, RestockInput } from '../../application/ports/InventoryRepository';
import type { CreateProductUseCase } from '../../application/use-cases/createProductUseCase';
import type { RecordRestockUseCase } from '../../application/use-cases/recordRestockUseCase';
import type { RecordSaleUseCase } from '../../application/use-cases/recordSaleUseCase';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';

export function createInventoryRoutes({
  inventoryRepository,
  createProductUseCase,
  recordRestockUseCase,
  recordSaleUseCase,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  inventoryRepository: InventoryRepository;
  createProductUseCase: CreateProductUseCase;
  recordRestockUseCase: RecordRestockUseCase;
  recordSaleUseCase: RecordSaleUseCase;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

  router.get('/public', async (req: Request, res: Response) => {
    const tenantId = typeof req.query.tenantId === 'string' ? req.query.tenantId : '';
    if (!tenantId) return res.status(400).json({ message: 'tenantId is required' });

    const items = await inventoryRepository.listPublic(tenantId);
    res.json(items);
  });

  const sanitizeProductForSeller = (product: any, role: string) => {
    if (role === 'SELLER') {
      const sanitized = { ...product };
      delete sanitized.lastCost;
      delete sanitized.averageCost;
      delete sanitized.totalPurchaseUnits;
      delete sanitized.totalPurchaseCost;
      delete sanitized.restocks;
      return sanitized;
    }
    return product;
  };

  router.get('/', authMiddleware, requireRolesMiddleware('ADMIN', 'SELLER'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    const role = req.auth?.role;
    if (!role) return res.status(401).json({ message: 'No role' });
    if (!tenantId && role !== 'GOD') return res.status(403).json({ message: 'No tenantId' });

    const items = await inventoryRepository.list(tenantId || '');
    const sanitizedItems = items.map(item => sanitizeProductForSeller(item, role));
    res.json(sanitizedItems);
  });

  router.get('/:id', authMiddleware, requireRolesMiddleware('ADMIN', 'SELLER'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    const role = req.auth?.role;
    if (!role) return res.status(401).json({ message: 'No role' });
    if (!tenantId && role !== 'GOD') return res.status(403).json({ message: 'No tenantId' });

    const item = await inventoryRepository.findById(req.params.id, tenantId || '');
    if (!item) return res.status(404).json({ message: 'Producto no encontrado' });

    res.json(sanitizeProductForSeller(item, role));
  });

  router.post('/', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    const role = req.auth?.role;
    if (!role) return res.status(401).json({ message: 'No role' });
    if (!tenantId && role !== 'GOD') return res.status(403).json({ message: 'No tenantId' });

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
    const role = req.auth?.role;
    if (!role) return res.status(401).json({ message: 'No role' });
    if (!tenantId && role !== 'GOD') return res.status(403).json({ message: 'No tenantId' });

    const result = await recordSaleUseCase.execute({
      tenantId,
      items: (req.body as { items?: Array<{ productId: string; quantity: number }> })?.items
    });

    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.json(result);
  });

  router.post('/restock', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    const role = req.auth?.role;
    if (!role) return res.status(401).json({ message: 'No role' });
    if (!tenantId && role !== 'GOD') return res.status(403).json({ message: 'No tenantId' });

    const result = await recordRestockUseCase.execute({
      tenantId,
      input: req.body as RestockInput
    });

    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.json(result.product);
  });

  return router;
}
