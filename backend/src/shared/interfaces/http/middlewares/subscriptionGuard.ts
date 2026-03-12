import type { NextFunction, Request, Response } from 'express';
import type { TenantsRepository } from '../../../../modules/tenants/application/ports/TenantsRepository';

export function subscriptionGuard({ tenantsRepository }: { tenantsRepository: TenantsRepository }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.auth?.tenantId;
      if (!tenantId) {
        return next();
      }

      const tenant = await tenantsRepository.findById(tenantId);
      
      if (tenant?.status === 'suspended') {
        return res.status(402).json({
          message: 'Payment Required: El tenant se encuentra suspendido por falta de pago.'
        });
      }

      return next();
    } catch (error) {
      // Fallback seguro en caso de error de BD, para no tumbar la API
      return next();
    }
  };
}
