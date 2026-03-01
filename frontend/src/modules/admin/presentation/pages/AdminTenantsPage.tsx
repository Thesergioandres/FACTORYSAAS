import { useEffect, useState } from 'react';
import { apiRequest } from '../../../../shared/infrastructure/http/apiClient';
import { AdminNav } from '../components/AdminNav';

type TenantEntity = {
  id: string;
  slug: string;
  subdomain?: string;
  name: string;
  status: string;
  planId: string;
  planName?: string;
  config: {
    bufferTimeMinutes: number;
    requirePaymentForNoShows: boolean;
    maxNoShowsBeforePayment: number;
  };
};

type Plan = {
  id: string;
  name: string;
  price: number;
  maxBranches: number;
  maxBarbers: number;
  maxMonthlyAppointments: number;
  features: string[];
};

type Metrics = {
  total: number;
  byStatus: Record<string, number>;
};

type WhatsAppUsage = {
  tenantId: string;
  tenantName: string;
  totalMessages: number;
};

const statusLabels: Record<string, { label: string; className: string }> = {
  trial: { label: 'Trial', className: 'bg-amber-900/40 text-amber-200' },
  active: { label: 'Activo', className: 'bg-emerald-900/40 text-emerald-200' },
  suspended: { label: 'Suspendido', className: 'bg-red-900/40 text-red-200' }
};

export function AdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantEntity[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planDrafts, setPlanDrafts] = useState<Record<string, Plan>>({});
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [usage, setUsage] = useState<WhatsAppUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTenants() {
      try {
        const [tenantsData, metricsData, plansData, usageData] = await Promise.all([
          apiRequest<TenantEntity[]>('/tenants'),
          apiRequest<Metrics>('/tenants/metrics'),
          apiRequest<Plan[]>('/plans'),
          apiRequest<WhatsAppUsage[]>('/tenants/usage/whatsapp')
        ]);
        setTenants(tenantsData);
        setMetrics(metricsData);
        setPlans(plansData);
        setUsage(usageData);
        setPlanDrafts(plansData.reduce<Record<string, Plan>>((acc, plan) => {
          acc[plan.id] = plan;
          return acc;
        }, {}));
      } catch (err: any) {
        setError(err.message || 'Error al cargar los tenants');
      } finally {
        setLoading(false);
      }
    }

    fetchTenants();
  }, []);

  const updatePlanDraft = (planId: string, patch: Partial<Plan>) => {
    setPlanDrafts((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], ...patch }
    }));
  };

  const savePlan = async (planId: string) => {
    try {
      const draft = planDrafts[planId];
      await apiRequest<Plan>(`/plans/${planId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          price: Number(draft.price),
          maxBranches: Number(draft.maxBranches),
          maxBarbers: Number(draft.maxBarbers),
          maxMonthlyAppointments: Number(draft.maxMonthlyAppointments),
          features: draft.features
        })
      });
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar el plan');
    }
  };

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Negocios (Tenants)</h2>
        <p className="section-subtitle">Centro de control para la factory SaaS.</p>
      </header>

      <AdminNav />

      {error ? (
        <p className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>
      ) : null}

      {metrics ? (
        <div className="grid gap-3 md:grid-cols-4">
          <div className="app-card">
            <p className="text-xs text-zinc-400">Total Tenants</p>
            <p className="text-2xl font-semibold">{metrics.total}</p>
          </div>
          <div className="app-card">
            <p className="text-xs text-zinc-400">Trial</p>
            <p className="text-2xl font-semibold">{metrics.byStatus.trial || 0}</p>
          </div>
          <div className="app-card">
            <p className="text-xs text-zinc-400">Activos</p>
            <p className="text-2xl font-semibold">{metrics.byStatus.active || 0}</p>
          </div>
          <div className="app-card">
            <p className="text-xs text-zinc-400">Suspendidos</p>
            <p className="text-2xl font-semibold">{metrics.byStatus.suspended || 0}</p>
          </div>
        </div>
      ) : null}

      <div className="app-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Lista de Barberías</h3>
          <button className="btn-primary py-1 px-3 text-xs" disabled>
            + Nuevo Tenant
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-400">Cargando negocios...</p>
        ) : tenants.length === 0 ? (
          <p className="text-sm text-zinc-400">No hay negocios registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="py-3 pr-4 font-medium">Nombre</th>
                  <th className="py-3 px-4 font-medium">Slug</th>
                  <th className="py-3 px-4 font-medium">Plan</th>
                  <th className="py-3 px-4 font-medium">Estado</th>
                  <th className="py-3 pl-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenants.map((tenant) => {
                  const status = statusLabels[tenant.status] || statusLabels.active;
                  return (
                    <tr key={tenant.id} className="transition-colors hover:bg-white/5">
                      <td className="py-3 pr-4 font-medium text-white">{tenant.name}</td>
                      <td className="py-3 px-4 text-zinc-300">{tenant.slug}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-zinc-200">
                          {tenant.planName || tenant.planId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <button className="text-xs font-semibold text-zinc-400 hover:text-white" disabled>
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="app-card space-y-4">
        <h3 className="text-sm font-semibold">Gestión de planes</h3>
        {plans.length === 0 ? (
          <p className="text-sm text-zinc-400">No hay planes configurados.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => {
              const draft = planDrafts[plan.id] || plan;
              return (
                <div key={plan.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{plan.name}</p>
                    <button className="btn-secondary px-3 py-1 text-xs" onClick={() => savePlan(plan.id)}>
                      Guardar
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 text-xs text-zinc-300">
                    <label>
                      Precio
                      <input
                        className="input-field mt-2"
                        type="number"
                        value={draft.price}
                        onChange={(event) => updatePlanDraft(plan.id, { price: Number(event.target.value) })}
                      />
                    </label>
                    <label>
                      Max Sedes
                      <input
                        className="input-field mt-2"
                        type="number"
                        value={draft.maxBranches}
                        onChange={(event) => updatePlanDraft(plan.id, { maxBranches: Number(event.target.value) })}
                      />
                    </label>
                    <label>
                      Max Barberos
                      <input
                        className="input-field mt-2"
                        type="number"
                        value={draft.maxBarbers}
                        onChange={(event) => updatePlanDraft(plan.id, { maxBarbers: Number(event.target.value) })}
                      />
                    </label>
                    <label>
                      Max Citas / Mes
                      <input
                        className="input-field mt-2"
                        type="number"
                        value={draft.maxMonthlyAppointments}
                        onChange={(event) => updatePlanDraft(plan.id, { maxMonthlyAppointments: Number(event.target.value) })}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="app-card">
        <h3 className="text-sm font-semibold">Consumo WhatsApp por Tenant</h3>
        {usage.length === 0 ? (
          <p className="text-sm text-zinc-400">Sin consumo registrado.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {usage.map((item) => (
              <li key={item.tenantId} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                <span>{item.tenantName}</span>
                <span className="font-semibold">{item.totalMessages}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
