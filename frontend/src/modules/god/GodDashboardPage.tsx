import { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../shared/animations/gsapConfig';
import { apiRequest } from '../../shared/infrastructure/http/apiClient';

type TenantRecord = {
  id: string;
  name: string;
  status: string;
  planId?: string;
  planName?: string;
  email?: string | null;
  createdAt?: string;
  validUntil?: string | null;
};

type Plan = {
  id: string;
  name: string;
  price: number;
};

type TenantsMetrics = {
  total: number;
  byStatus: Record<string, number>;
};

type WhatsAppHealth = {
  status: 'online' | 'offline';
  lastWebhookAt?: string | null;
};

type ApiHealth = {
  ok: boolean;
  service: string;
  timestamp: string;
  mongoConnected: boolean;
  latencyMs: number;
};

const USD_TO_COP = 4000;

export function GodDashboardPage() {
  const queryClient = useQueryClient();
  const [deletingTenantId, setDeletingTenantId] = useState<string | null>(null);
  const kpiRef = useRef<HTMLDivElement | null>(null);
  const tenantsQuery = useQuery({
    queryKey: ['tenants'],
    queryFn: () => apiRequest<TenantRecord[]>('/tenants')
  });

  const metricsQuery = useQuery({
    queryKey: ['tenants-metrics'],
    queryFn: () => apiRequest<TenantsMetrics>('/tenants/metrics')
  });

  const plansQuery = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiRequest<Plan[]>('/plans')
  });

  const whatsappHealthQuery = useQuery({
    queryKey: ['whatsapp-health'],
    queryFn: () => apiRequest<WhatsAppHealth>('/notifications/health')
  });

  const systemHealthQuery = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const started = performance.now();
      const data = await apiRequest<Omit<ApiHealth, 'latencyMs'>>('/health');
      const latencyMs = Math.round(performance.now() - started);
      return { ...data, latencyMs };
    }
  });

  const activeTenants = useMemo(() => {
    const list = tenantsQuery.data || [];
    return list.filter((tenant) => tenant.status === 'active');
  }, [tenantsQuery.data]);

  const churnRate = useMemo(() => {
    const list = tenantsQuery.data || [];
    if (list.length === 0) return 0;
    const now = Date.now();
    const churned = list.filter((tenant) => {
      if (tenant.status === 'suspended' || tenant.status === 'expired') return true;
      if (tenant.validUntil) {
        return new Date(tenant.validUntil).getTime() < now;
      }
      return false;
    }).length;
    return Math.round((churned / list.length) * 100);
  }, [tenantsQuery.data]);

  const totalRevenueCop = useMemo(() => {
    const priceByPlan = new Map((plansQuery.data || []).map((plan) => [plan.id, plan.price]));
    const totalUsd = activeTenants.reduce(
      (sum, tenant) => sum + (tenant.planId ? priceByPlan.get(tenant.planId) || 0 : 0),
      0
    );
    return totalUsd * USD_TO_COP;
  }, [activeTenants, plansQuery.data]);

  const mrrCop = totalRevenueCop;

  const formatCop = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);

  const isHealthOnline = whatsappHealthQuery.data?.status === 'online';
  const isMongoOnline = systemHealthQuery.data?.mongoConnected === true;

  useGSAP(
    () => {
      gsap.from('.god-kpi-card', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.12
      });
    },
    { scope: kpiRef }
  );

  const deleteTenant = async (tenantId: string, tenantName: string) => {
    const confirmed = window.confirm(
      `Vas a eliminar el tenant "${tenantName}" y toda su informacion. Esta accion es irreversible. Deseas continuar?`
    );
    if (!confirmed) return;
    setDeletingTenantId(tenantId);
    try {
      await apiRequest(`/tenants/${tenantId}`, { method: 'DELETE' });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tenants'] }),
        queryClient.invalidateQueries({ queryKey: ['tenants-metrics'] })
      ]);
    } finally {
      setDeletingTenantId(null);
    }
  };

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Dashboard Global</h2>
        <p className="section-subtitle">Panel administrativo y financiero de la fabrica SaaS.</p>
      </header>

      <div ref={kpiRef} className="grid gap-4 md:grid-cols-3">
        <div className="app-card god-kpi-card">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">MRR (COP)</p>
          <p className="mt-4 text-3xl font-semibold">
            {plansQuery.isLoading ? '...' : formatCop(mrrCop)}
          </p>
          <p className="mt-2 text-xs text-muted">Suma de planes activos.</p>
        </div>
        <div className="app-card god-kpi-card">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Churn Rate</p>
          <p className="mt-4 text-3xl font-semibold">{tenantsQuery.isLoading ? '...' : `${churnRate}%`}</p>
          <p className="mt-2 text-xs text-muted">Tenants con suscripcion vencida.</p>
        </div>
        <div className="app-card god-kpi-card">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">System Health</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>MongoDB</span>
              <span className={isMongoOnline ? 'text-emerald-200' : 'text-red-200'}>
                {systemHealthQuery.isLoading ? '...' : isMongoOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Latencia API</span>
              <span>{systemHealthQuery.isLoading ? '...' : `${systemHealthQuery.data?.latencyMs ?? 0} ms`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="app-card god-kpi-card">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Ingresos Totales (COP)</p>
          <p className="mt-4 text-3xl font-semibold">
            {plansQuery.isLoading ? '...' : formatCop(totalRevenueCop)}
          </p>
          <p className="mt-2 text-xs text-muted">Estimado por planes activos.</p>
        </div>
        <div className="app-card god-kpi-card">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">WhatsApp Health</p>
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                isHealthOnline ? 'bg-emerald-900/40 text-emerald-200' : 'bg-red-900/40 text-red-200'
              }`}
            >
              {whatsappHealthQuery.isLoading ? 'Cargando...' : isHealthOnline ? 'Online' : 'Offline'}
            </span>
            {whatsappHealthQuery.data?.lastWebhookAt ? (
              <span className="text-xs text-muted">Ultimo ping: {new Date(whatsappHealthQuery.data.lastWebhookAt).toLocaleString()}</span>
            ) : null}
          </div>
        </div>
        <div className="app-card god-kpi-card">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Tenants Activos</p>
          <p className="mt-4 text-3xl font-semibold">
            {metricsQuery.isLoading ? '...' : metricsQuery.data?.byStatus?.active || 0}
          </p>
        </div>
      </div>

      <div className="app-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Tenants registrados</h3>
            <p className="text-sm text-muted">Listado global de empresas en la plataforma.</p>
          </div>
          <span className="status-pill">
            {tenantsQuery.isLoading ? '...' : `${tenantsQuery.data?.length || 0} total`}
          </span>
        </div>

        {tenantsQuery.isLoading ? (
          <p className="mt-4 text-sm text-muted">Cargando tenants...</p>
        ) : (tenantsQuery.data || []).length === 0 ? (
          <p className="mt-4 text-sm text-muted">No hay tenants registrados.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="py-3 pr-4 font-medium">Empresa</th>
                  <th className="py-3 px-4 font-medium">Plan</th>
                  <th className="py-3 px-4 font-medium">Estado</th>
                  <th className="py-3 px-4 font-medium">Contacto</th>
                  <th className="py-3 px-4 font-medium">Registro</th>
                  <th className="py-3 pl-4 font-medium text-right">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(tenantsQuery.data || []).map((tenant) => (
                  <tr key={tenant.id} className="transition-colors hover:bg-white/5">
                    <td className="py-3 pr-4 font-medium text-white">{tenant.name}</td>
                    <td className="py-3 px-4 text-zinc-300">{tenant.planName || tenant.planId || 'Sin plan'}</td>
                    <td className="py-3 px-4 text-zinc-300">{tenant.status}</td>
                    <td className="py-3 px-4 text-zinc-300">{tenant.email || 'Sin correo'}</td>
                    <td className="py-3 px-4 text-zinc-300">
                      {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <button
                        className="btn-ghost text-xs text-secondary"
                        type="button"
                        onClick={() => deleteTenant(tenant.id, tenant.name)}
                        disabled={deletingTenantId === tenant.id}
                      >
                        {deletingTenantId === tenant.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
