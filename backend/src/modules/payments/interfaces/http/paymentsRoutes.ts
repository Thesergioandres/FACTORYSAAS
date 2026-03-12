import { Router, type Request, type Response } from 'express';
import type { PaymentsService } from '../../application/PaymentsService';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';

export function createPaymentsRoutes({
  paymentsService,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  paymentsService: PaymentsService;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

  router.post('/create-preference', authMiddleware, requireRolesMiddleware('ADMIN', 'OWNER', 'GOD'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const { planId } = (req.body || {}) as { planId?: string };
    if (!planId) return res.status(400).json({ message: 'planId es requerido' });

    const result = await paymentsService.createPreference({ tenantId, planId });
    if ('error' in result) {
      return res.status(result.statusCode || 400).json({ message: result.error });
    }

    return res.json(result);
  });

  router.post('/create-subscription', authMiddleware, requireRolesMiddleware('ADMIN', 'OWNER', 'GOD'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const { planId, payerEmail } = (req.body || {}) as { planId?: string; payerEmail?: string };
    if (!planId) return res.status(400).json({ message: 'planId es requerido' });

    const result = await paymentsService.createSubscription({ tenantId, planId, payerEmail });
    if ('error' in result) {
      return res.status(result.statusCode || 400).json({ message: result.error });
    }

    return res.json(result);
  });

  router.post('/webhook', async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-signature'] as string;
      const requestId = req.headers['x-request-id'] as string;
      const body = req.body as { type?: string; topic?: string; data?: { id?: string } };

      const result = await paymentsService.handleWebhook(body, signature, requestId);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Webhook error' });
    }
  });

  return router;
}
