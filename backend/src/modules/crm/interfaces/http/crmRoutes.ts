import { Router, type Request, type Response } from 'express';
import type { CustomersRepository } from '../../application/ports/CustomersRepository';
import type { AddCustomerToTenantUseCase } from '../../application/use-cases/AddCustomerToTenantUseCase';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';

export function createCrmRoutes({
  customersRepository,
  addCustomerToTenantUseCase,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  customersRepository: CustomersRepository;
  addCustomerToTenantUseCase: AddCustomerToTenantUseCase;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

  router.get('/customers', authMiddleware, requireRolesMiddleware('ADMIN', 'OWNER', 'STAFF'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const customers = await customersRepository.listByTenant(tenantId);
    return res.json(customers);
  });

  router.post('/customers', authMiddleware, requireRolesMiddleware('ADMIN', 'OWNER', 'STAFF'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const payload = (req.body || {}) as { name?: string; email?: string; phone?: string; notes?: string; tags?: string[] };
    const result = await addCustomerToTenantUseCase.execute({
      tenantId,
      name: payload.name || '',
      email: payload.email,
      phone: payload.phone,
      notes: payload.notes,
      tags: payload.tags
    });

    if ('error' in result) {
      const statusCode = result.statusCode ?? 400;
      return res.status(statusCode).json({ message: result.error });
    }

    return res.status(201).json(result.customer);
  });

  return router;
}
