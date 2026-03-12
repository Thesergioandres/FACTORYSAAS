import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../../../domain/roles';

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.auth?.role;
    if (!userRole) {
      return res.status(403).json({ message: 'No autorizado para esta acción' });
    }

    if (userRole === 'GOD') {
      const operationalBases = [
        '/appointments',
        '/inventory',
        '/services',
        '/branches',
        '/barbers',
        '/pos',
        '/tables'
      ];
      const base = req.baseUrl.toLowerCase();
      const isCreate = req.method === 'POST' && (req.path === '/' || req.path === '');
      if (isCreate && operationalBases.some((route) => base.includes(route))) {
        return res.status(403).json({ message: 'GOD no puede crear registros operativos' });
      }
      return next();
    }

    if (userRole === 'OWNER') {
      return next();
    }

    const tenantId = req.auth?.tenantId;
    const paramTenantId = typeof req.params.tenantId === 'string' ? req.params.tenantId : undefined;
    const queryTenantId = typeof req.query.tenantId === 'string' ? req.query.tenantId : undefined;
    const bodyTenantId = typeof req.body?.tenantId === 'string' ? req.body.tenantId : undefined;
    const baseTenantId = req.baseUrl.includes('/tenants') && typeof req.params.id === 'string'
      ? req.params.id
      : undefined;
    const resourceTenantId = paramTenantId || queryTenantId || bodyTenantId || baseTenantId;

    if (tenantId && resourceTenantId && tenantId !== resourceTenantId) {
      return res.status(403).json({ message: 'No autorizado para este tenant' });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'No autorizado para esta acción' });
    }

    return next();
  };
}

export const RoleGuard = requireRoles;
