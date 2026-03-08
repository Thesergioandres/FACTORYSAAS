import { Router, type Request, type Response } from 'express';
import type { CreateInvoiceUseCase } from '../../application/use-cases/CreateInvoiceUseCase';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';

export function createBillingRoutes({
  createInvoiceUseCase,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  createInvoiceUseCase: CreateInvoiceUseCase;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

  router.post('/invoices', authMiddleware, requireRolesMiddleware('ADMIN', 'OWNER', 'STAFF'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const payload = (req.body || {}) as { subtotal?: number; currency?: string };
    const subtotal = Number(payload.subtotal ?? 0);
    const currency = String(payload.currency || 'COP');

    const result = await createInvoiceUseCase.execute({ tenantId, subtotal, currency });
    if ('error' in result) {
      const statusCode = result.statusCode ?? 400;
      return res.status(statusCode).json({ message: result.error });
    }

    return res.status(201).json(result.invoice);
  });

  return router;
}
