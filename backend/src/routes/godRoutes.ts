import { Router, type Request, type Response } from 'express';
import { TenantModel } from '../shared/infrastructure/mongoose/models/TenantModel';
import { UserModel } from '../shared/infrastructure/mongoose/models/UserModel';
import { requireRoles } from '../shared/interfaces/http/middlewares/requireRoles';
import { authenticateJwt } from '../shared/interfaces/http/middlewares/authenticateJwt';
import { env } from '../config/env';
import { TenantStatus } from '../modules/tenants/domain/enums/TenantEnums';

export function createGodRoutes() {
  const router = Router();
  const authMiddleware = authenticateJwt({ jwtSecret: env.jwtSecret });

  router.get('/tenants/pending', authMiddleware, requireRoles('GOD'), async (_req: Request, res: Response) => {
    try {
      const pendingTenants = await TenantModel.find({ status: TenantStatus.PENDING }).lean();
      
      const tenantsWithUsers = await Promise.all(pendingTenants.map(async (tenant) => {
        const users = await UserModel.find({ tenantId: tenant._id.toString(), approved: false })
          .select('-passwordHash')
          .lean();
        return {
          ...tenant,
          users
        };
      }));

      res.json(tenantsWithUsers);
    } catch (error) {
      console.error('Error obteniendo tenants pendientes', error);
      res.status(500).json({ message: 'Error interno obteniendo tenants' });
    }
  });

  router.patch('/tenants/:id/approve', authMiddleware, requireRoles('GOD'), async (req: Request, res: Response) => {
    try {
      const tenantId = req.params.id;
      
      // Activar el Tenant y darle 30 días de vigencia por defecto
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + 30);

      const tenant = await TenantModel.findByIdAndUpdate(
        tenantId,
        { 
          status: TenantStatus.ACTIVE,
          validUntil: validUntilDate
        },
        { new: true }
      );

      if (!tenant) {
        return res.status(404).json({ message: 'Tenant no encontrado' });
      }

      // Aprobar el usuario dueño/admin de ese tenant
      await UserModel.updateMany(
        { tenantId, approved: false },
        { approved: true }
      );

      res.json({ message: 'Tenant y usuario aprobados exitosamente', tenant });
    } catch (error) {
      console.error('Error aprobando tenant', error);
      res.status(500).json({ message: 'Error aprobando tenant' });
    }
  });

  return router;
}
