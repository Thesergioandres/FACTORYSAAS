import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import type { ModuleKey } from '../constants/moduleRegistry';
import { ModuleUpsellCard } from './ModuleUpsellCard';

export function ModuleGuard({ allow, children }: { allow: ModuleKey[]; children: ReactNode }) {
  const { user } = useAuth();
  const { tenant, loading } = useTenant();
  const location = useLocation();
  const staffAllowedModules = new Set(['agenda', 'inventory', 'pos', 'tables', 'kitchen_display']);

  if (loading) {
    return <div className="app-card">Cargando modulos...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role === 'GOD' || user.role === 'OWNER' || allow.length === 0) {
    return <>{children}</>;
  }

  if (user.role === 'STAFF' && !allow.some((moduleKey) => staffAllowedModules.has(moduleKey))) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const activeModules = tenant?.activeModules || [];
  const hasAccess = allow.some((moduleKey) => activeModules.includes(moduleKey));

  if (!hasAccess) {
    return (
      <ModuleUpsellCard
        title="Activa este modulo"
        description="Tu plan actual no incluye esta funcion. Mejora tu plan para desbloquearla de inmediato."
      />
    );
  }

  return <>{children}</>;
}
