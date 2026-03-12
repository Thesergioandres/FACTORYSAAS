import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { database } from '../../../../shared/infrastructure/memory/database';
import { AppointmentHistoryModel } from '../../../../shared/infrastructure/mongoose/models/AppointmentHistoryModel';
import { AppointmentModel } from '../../../../shared/infrastructure/mongoose/models/AppointmentModel';
import { AuditLogModel } from '../../../../shared/infrastructure/mongoose/models/AuditLogModel';
import { BranchModel } from '../../../../shared/infrastructure/mongoose/models/BranchModel';
import { ProductModel } from '../../../../shared/infrastructure/mongoose/models/ProductModel';
import { ServiceModel } from '../../../../shared/infrastructure/mongoose/models/ServiceModel';
import { StaffBlockModel, StaffScheduleModel } from '../../../../shared/infrastructure/mongoose/models/StaffAvailabilityModels';
import { TenantModel } from '../../../../shared/infrastructure/mongoose/models/TenantModel';
import { UserModel } from '../../../../shared/infrastructure/mongoose/models/UserModel';
import { WhatsAppLogModel } from '../../../../shared/infrastructure/mongoose/models/WhatsAppLogModel';
import { suspendExpiredTenants } from '../../../../jobs/tenantSuspension';
import type { TenantsRepository } from '../../application/ports/TenantsRepository';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';
import { TenantStatus } from '../../domain/enums/TenantEnums';
import { UpdateBusinessProfileUseCase } from '../../application/use-cases/UpdateBusinessProfileUseCase';

export function createTenantsRoutes(deps: { 
  tenantsRepository: TenantsRepository;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();
  const updateBusinessProfileUseCase = new UpdateBusinessProfileUseCase(deps.tenantsRepository);

  const deleteTenantCascade = async (tenantId: string) => {
    if (mongoose.connection.readyState === 1) {
      const users = await UserModel.find({ tenantId }).lean();
      const userIds = users.map((user) => user._id.toString());
      const appointments = await AppointmentModel.find({ tenantId }).select('_id').lean();
      const appointmentIds = appointments.map((item) => item._id.toString());

      await StaffScheduleModel.deleteMany({ staffId: { $in: userIds } });
      await StaffBlockModel.deleteMany({ staffId: { $in: userIds } });
      if (appointmentIds.length > 0) {
        await AppointmentHistoryModel.deleteMany({ appointmentId: { $in: appointmentIds } });
      }
      await AppointmentModel.deleteMany({ tenantId });
      await ProductModel.deleteMany({ tenantId });
      await ServiceModel.deleteMany({ tenantId });
      await BranchModel.deleteMany({ tenantId });
      await WhatsAppLogModel.deleteMany({ tenantId });
      await UserModel.deleteMany({ tenantId });
      if (userIds.length > 0) {
        await AuditLogModel.deleteMany({ userId: { $in: userIds } });
      }

      const deleted = await TenantModel.deleteOne({ _id: tenantId });
      return deleted.deletedCount > 0;
    }

    const appointmentIds = database.appointments
      .filter((appointment) => appointment.tenantId === tenantId)
      .map((appointment) => appointment.id);

    database.appointments = database.appointments.filter((appointment) => appointment.tenantId !== tenantId);
    database.appointmentHistory = database.appointmentHistory.filter((entry) => {
      const appointmentId = (entry as { appointmentId?: string }).appointmentId;
      return !appointmentId || !appointmentIds.includes(appointmentId);
    });
    database.inventory = database.inventory.filter((product) => product.tenantId !== tenantId);
    database.services = database.services.filter((service) => service.tenantId !== tenantId);
    database.branches = database.branches.filter((branch) => branch.tenantId !== tenantId);
    database.whatsappLogs = database.whatsappLogs.filter((log) => (log as { tenantId?: string }).tenantId !== tenantId);

    const tenantUsers = database.users.filter((user) => user.tenantId === tenantId).map((user) => user.id);
    database.users = database.users.filter((user) => user.tenantId !== tenantId);
    database.staffSchedules = database.staffSchedules.filter((item) => {
      const staffId = (item as { staffId?: string }).staffId;
      return !staffId || !tenantUsers.includes(staffId);
    });
    database.staffBlocks = database.staffBlocks.filter((item) => {
      const staffId = (item as { staffId?: string }).staffId;
      return !staffId || !tenantUsers.includes(staffId);
    });
    database.tenants = database.tenants.filter((tenant) => tenant.id !== tenantId);

    return true;
  };

  router.get('/', deps.authenticateJwt, deps.requireRoles('GOD'), async (_req: Request, res: Response) => {
    const tenants = await deps.tenantsRepository.listAll();
    return res.json(tenants);
  });

  router.get('/metrics', deps.authenticateJwt, deps.requireRoles('GOD'), async (_req: Request, res: Response) => {
    const tenants = await deps.tenantsRepository.listAll();
    const byStatus = tenants.reduce<Record<string, number>>((acc, tenant) => {
      acc[tenant.status] = (acc[tenant.status] || 0) + 1;
      return acc;
    }, {});

    return res.json({ total: tenants.length, byStatus });
  });

  router.post('/trigger-suspensions', deps.authenticateJwt, deps.requireRoles('GOD'), async (_req: Request, res: Response) => {
    await suspendExpiredTenants();
    return res.json({ message: 'Job de suspensión ejecutado manualmente' });
  });

  router.get('/config', deps.authenticateJwt, async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const tenant = await deps.tenantsRepository.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    return res.json({
      tenantId: tenant.id,
      verticalSlug: tenant.verticalSlug,
      activeModules: tenant.activeModules || [],
      features: (tenant as { features?: string[] }).features || []
    });
  });

  router.post('/:id/suspend', deps.authenticateJwt, deps.requireRoles('GOD'), async (req: Request, res: Response) => {
    const updated = await deps.tenantsRepository.update(req.params.id, {
      status: TenantStatus.SUSPENDED
    });

    if (!updated) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    return res.json(updated);
  });

  router.delete('/:id', deps.authenticateJwt, deps.requireRoles('GOD'), async (req: Request, res: Response) => {
    const tenantId = req.params.id;
    const deleted = await deleteTenantCascade(tenantId);
    if (!deleted) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    return res.json({ message: 'Tenant eliminado con borrado en cascada.' });
  });

  router.get('/me/export', deps.authenticateJwt, deps.requireRoles('ADMIN', 'OWNER'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const tenant = await deps.tenantsRepository.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    if (mongoose.connection.readyState === 1) {
      const [users, appointments, services, products, branches, whatsappLogs] = await Promise.all([
        UserModel.find({ tenantId }).lean(),
        AppointmentModel.find({ tenantId }).lean(),
        ServiceModel.find({ tenantId }).lean(),
        ProductModel.find({ tenantId }).lean(),
        BranchModel.find({ tenantId }).lean(),
        WhatsAppLogModel.find({ tenantId }).lean()
      ]);

      return res.json({
        exportedAt: new Date().toISOString(),
        tenant,
        users,
        appointments,
        services,
        products,
        branches,
        whatsappLogs
      });
    }

    return res.json({
      exportedAt: new Date().toISOString(),
      tenant,
      users: database.users.filter((user) => user.tenantId === tenantId),
      appointments: database.appointments.filter((item) => item.tenantId === tenantId),
      services: database.services.filter((item) => item.tenantId === tenantId),
      products: database.inventory.filter((item) => item.tenantId === tenantId),
      branches: database.branches.filter((item) => item.tenantId === tenantId),
      whatsappLogs: database.whatsappLogs.filter((item) => (item as { tenantId?: string }).tenantId === tenantId)
    });
  });

  router.post('/me/delete', deps.authenticateJwt, deps.requireRoles('ADMIN', 'OWNER'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const deleted = await deleteTenantCascade(tenantId);
    if (!deleted) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    return res.json({ message: 'Solicitud ejecutada. Datos eliminados o anonimizados.' });
  });

  router.get('/usage/whatsapp', deps.authenticateJwt, deps.requireRoles('GOD'), async (_req: Request, res: Response) => {
    const tenants = await deps.tenantsRepository.listAll();
    const counts = new Map<string, number>();

    if (mongoose.connection.readyState === 1) {
      const aggregated = await WhatsAppLogModel.aggregate([
        { $group: { _id: '$tenantId', total: { $sum: 1 } } }
      ]);
      aggregated.forEach((item) => counts.set(String(item._id), Number(item.total)));
    } else {
      database.whatsappLogs.forEach((log) => {
        const tenantId = (log as { tenantId?: string }).tenantId || 'unknown';
        counts.set(tenantId, (counts.get(tenantId) || 0) + 1);
      });
    }

    const usage = tenants.map((tenant) => ({
      tenantId: tenant.id,
      tenantName: tenant.name,
      totalMessages: counts.get(tenant.id) || 0
    }));

    return res.json(usage);
  });

  router.get('/slug/:slug', async (req: Request, res: Response) => {
    const tenant = await deps.tenantsRepository.findBySlug(req.params.slug);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }
    return res.json({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      businessProfile: tenant.businessProfile,
      subdomain: tenant.subdomain,
      email: tenant.email,
      phone: tenant.phone,
      createdAt: tenant.createdAt,
      verticalSlug: tenant.verticalSlug,
      activeModules: tenant.activeModules,
      customColors: tenant.customColors,
      logoUrl: tenant.logoUrl,
      status: tenant.status
    });
  });

  router.get('/public/:verticalSlug/:tenantSlug', async (req: Request, res: Response) => {
    const tenant = await deps.tenantsRepository.findByPublicPath(req.params.verticalSlug, req.params.tenantSlug);
    if (!tenant || !tenant.businessProfile) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    return res.json({
      id: tenant.id,
      verticalSlug: tenant.verticalSlug,
      businessProfile: tenant.businessProfile
    });
  });

  router.put('/:id/profile', deps.authenticateJwt, deps.requireRoles('ADMIN', 'OWNER', 'GOD'), async (req: Request, res: Response) => {
    const requester = req.auth;
    if (!requester) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (requester.role !== 'GOD' && requester.tenantId !== req.params.id) {
      return res.status(403).json({ message: 'No autorizado para este tenant' });
    }

    const { slug, name, phone, address, logoUrl, primaryColor } = req.body as {
      slug?: string;
      name?: string;
      phone?: string;
      address?: string;
      logoUrl?: string;
      primaryColor?: string;
    };

    const result = await updateBusinessProfileUseCase.execute({
      tenantId: req.params.id,
      slug: slug || '',
      name: name || '',
      phone: phone || '',
      address: address || '',
      logoUrl: logoUrl || '',
      primaryColor: primaryColor || ''
    });

    if ('error' in result) {
      return res.status(result.statusCode || 400).json({ message: result.error });
    }

    return res.json(result.tenant);
  });

  router.get('/:id', async (req: Request, res: Response) => {
    const tenant = await deps.tenantsRepository.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }
    return res.json(tenant);
  });

  router.patch('/:id/activate', deps.authenticateJwt, deps.requireRoles('GOD'), async (req: Request, res: Response) => {
    const { planId, validUntil } = req.body as { planId?: string; validUntil?: string };

    if (!planId || !validUntil) {
      return res.status(400).json({ message: 'planId y validUntil son requeridos' });
    }

    const parsedValidUntil = new Date(validUntil);
    if (Number.isNaN(parsedValidUntil.getTime())) {
      return res.status(400).json({ message: 'validUntil debe ser una fecha valida' });
    }

    const updated = await deps.tenantsRepository.update(req.params.id, {
      planId,
      status: TenantStatus.ACTIVE,
      validUntil: parsedValidUntil.toISOString()
    });

    if (!updated) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    return res.json(updated);
  });

  router.patch('/:id/logo', deps.authenticateJwt, deps.requireRoles('ADMIN'), async (req: Request, res: Response) => {
    const requester = req.auth;
    if (!requester) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    if (requester.role !== 'GOD' && requester.tenantId !== req.params.id) {
      return res.status(403).json({ message: 'No autorizado para este tenant' });
    }

    const { logoUrl } = req.body as { logoUrl?: string };
    if (!logoUrl) {
      return res.status(400).json({ message: 'logoUrl es requerido' });
    }

    const updated = await deps.tenantsRepository.update(req.params.id, { logoUrl });
    if (!updated) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    return res.json(updated);
  });

  router.patch('/:id', deps.authenticateJwt, deps.requireRoles('ADMIN', 'OWNER'), async (req: Request, res: Response) => {
    const requester = req.auth;
    if (!requester) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    if (requester.role !== 'GOD' && requester.role !== 'OWNER' && requester.tenantId !== req.params.id) {
      return res.status(403).json({ message: 'No autorizado para este tenant' });
    }

    const { businessHours, customColors, primaryColor, secondaryColor } = req.body as {
      businessHours?: Array<{ day: number; openTime: string; closeTime: string; isOpen: boolean }>;
      customColors?: { primary?: string; secondary?: string };
      primaryColor?: string;
      secondaryColor?: string;
    };

    if (businessHours && !Array.isArray(businessHours)) {
      return res.status(400).json({ message: 'businessHours debe ser un array' });
    }

    const nextCustomColors = customColors || (primaryColor || secondaryColor)
      ? {
          primary: primaryColor ?? customColors?.primary,
          secondary: secondaryColor ?? customColors?.secondary
        }
      : undefined;

    if (!businessHours && !nextCustomColors) {
      return res.status(400).json({ message: 'No hay cambios para aplicar' });
    }

    const updated = await deps.tenantsRepository.update(req.params.id, {
      ...(businessHours ? { businessHours } : {}),
      ...(nextCustomColors ? { customColors: nextCustomColors } : {})
    });
    if (!updated) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    return res.json(updated);
  });

  return router;
}
