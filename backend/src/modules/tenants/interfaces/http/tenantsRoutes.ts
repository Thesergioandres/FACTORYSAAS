import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { database } from '../../../../shared/infrastructure/memory/database';
import { WhatsAppLogModel } from '../../../../shared/infrastructure/mongoose/models/WhatsAppLogModel';
import { suspendExpiredTenants } from '../../../../jobs/tenantSuspension';
import type { TenantsRepository } from '../../application/ports/TenantsRepository';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';
import { TenantStatus } from '../../domain/enums/TenantEnums';

export function createTenantsRoutes(deps: { 
  tenantsRepository: TenantsRepository;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

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
