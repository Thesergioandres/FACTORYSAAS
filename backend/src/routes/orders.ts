import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'crypto';
import type { authenticateJwt } from '../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../shared/interfaces/http/middlewares/requireRoles';
import { publishKitchenOrder } from '../shared/infrastructure/realtime/ordersHub';

type OrderItemInput = { name: string; quantity: number; notes?: string };

type CreateOrderBody = {
  tableId?: string;
  tableLabel?: string;
  items?: OrderItemInput[];
};

export function createOrdersRoutes({
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

  router.post('/', authMiddleware, requireRolesMiddleware('ADMIN', 'OWNER', 'STAFF'), (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const body = (req.body || {}) as CreateOrderBody;
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      return res.status(400).json({ message: 'items es requerido' });
    }

    const sanitizedItems = items
      .filter((item) => item?.name && Number(item.quantity) > 0)
      .map((item) => ({
        name: String(item.name).trim(),
        quantity: Number(item.quantity),
        notes: item.notes ? String(item.notes).trim() : undefined
      }));

    if (!sanitizedItems.length) {
      return res.status(400).json({ message: 'items invalidos' });
    }

    const order = {
      id: randomUUID(),
      tenantId,
      tableId: body.tableId,
      tableLabel: body.tableLabel,
      items: sanitizedItems,
      status: 'NEW' as const,
      createdAt: new Date().toISOString()
    };

    publishKitchenOrder(tenantId, order);

    return res.status(201).json(order);
  });

  return { ordersRoutes: router };
}
