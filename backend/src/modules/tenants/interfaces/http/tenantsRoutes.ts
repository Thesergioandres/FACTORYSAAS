import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { database } from '../../../../shared/infrastructure/memory/database';
import { WhatsAppLogModel } from '../../../../shared/infrastructure/mongoose/models/WhatsAppLogModel';
import type { TenantsRepository } from '../../application/ports/TenantsRepository';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';

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

  return router;
}
