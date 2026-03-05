import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { PlanGuard } from '../../../shared/components/PlanGuard';
import { useTenant, type TenantRecord } from '../../../shared/context/TenantContext';
import { useLabels } from '../../../shared/hooks/useLabels';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/infrastructure/http/apiClient';
import { BusinessHoursSettings } from '../presentation/components/BusinessHoursSettings';
import { createDefaultBusinessHours, type BusinessHour } from '../../../shared/utils/businessHours';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

type SummaryResponse = {
  totalSales: number;
  appointmentsToday: number;
  totalProducts: number;
  activeStaff: number;
  salesTrend: number[];
};

export function AdminHomePage() {
  const { tenant, setTenant } = useTenant();
  const labels = useLabels();
  const [copied, setCopied] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(createDefaultBusinessHours());
  const [hoursSaving, setHoursSaving] = useState(false);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [hoursSuccess, setHoursSuccess] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#00F0FF');
  const [secondaryColor, setSecondaryColor] = useState('#8A2BE2');
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [brandSuccess, setBrandSuccess] = useState(false);
  const activeModules = tenant?.activeModules || [];
  const isBarbershop = (tenant?.verticalSlug || '').toLowerCase() === 'barberias';

  const showAgenda = activeModules.includes('agenda');
  const showStaff = activeModules.includes('staff');
  const showPos = activeModules.includes('pos');
  const showStorefront = activeModules.includes('ecommerce_storefront');
  const showInventory = activeModules.includes('inventory');

  const summaryQuery = useQuery({
    queryKey: ['reports', 'summary', tenant?.id],
    queryFn: async () => {
      try {
        return await apiRequest<SummaryResponse>('/reports/summary');
      } catch {
        return {
          totalSales: 0,
          appointmentsToday: 0,
          totalProducts: 0,
          activeStaff: 0,
          salesTrend: []
        } as SummaryResponse;
      }
    },
    enabled: Boolean(tenant?.id)
  });

  const summary = summaryQuery.data || {
    totalSales: 0,
    appointmentsToday: 0,
    totalProducts: 0,
    activeStaff: 0,
    salesTrend: []
  };

  const salesChartData = summary.salesTrend.length
    ? summary.salesTrend.map((value, index) => ({ day: `D${index + 1}`, sales: value }))
    : [];

  const publicUrl = useMemo(() => {
    if (!tenant?.subdomain) {
      return window.location.origin;
    }
    const hostParts = window.location.hostname.split('.');
    const baseDomain = hostParts.length > 2 ? hostParts.slice(1).join('.') : window.location.hostname;
    return `${window.location.protocol}//${tenant.subdomain}.${baseDomain}`;
  }, [tenant?.subdomain]);

  useEffect(() => {
    if (!tenant) return;
    setBusinessHours(
      tenant.businessHours && tenant.businessHours.length === 7
        ? tenant.businessHours
        : createDefaultBusinessHours()
    );
    setPrimaryColor(tenant.primaryColor || tenant.customColors?.primary || '#00F0FF');
    setSecondaryColor(tenant.secondaryColor || tenant.customColors?.secondary || '#8A2BE2');
  }, [tenant]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const uploadLogo = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const result = await apiRequest<{ url: string }>('/upload', {
      method: 'POST',
      body: formData
    });
    return result.url;
  };

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tenant?.id) return;
    setLogoUploading(true);
    setLogoError(null);
    try {
      const url = await uploadLogo(file);
      const updated = await apiRequest<TenantRecord>(`/tenants/${tenant.id}/logo`, {
        method: 'PATCH',
        body: JSON.stringify({ logoUrl: url })
      });
      setTenant(updated || { ...tenant, logoUrl: url });
    } catch (err: any) {
      setLogoError(err.message || 'No se pudo actualizar el logo');
    } finally {
      setLogoUploading(false);
    }
  };

  const hasInvalidHours = (hours: BusinessHour[]) => {
    return hours.some((entry) => {
      if (!entry.isOpen) return false;
      const [openHours, openMinutes] = entry.openTime.split(':').map((value) => Number(value));
      const [closeHours, closeMinutes] = entry.closeTime.split(':').map((value) => Number(value));
      const openTotal = openHours * 60 + openMinutes;
      const closeTotal = closeHours * 60 + closeMinutes;
      return Number.isNaN(openTotal) || Number.isNaN(closeTotal) || closeTotal <= openTotal;
    });
  };

  const handleSaveHours = async () => {
    if (!tenant?.id) return;
    setHoursError(null);
    setHoursSuccess(false);

    if (hasInvalidHours(businessHours)) {
      setHoursError('Corrige los horarios: la hora de cierre debe ser posterior a la de apertura.');
      return;
    }

    setHoursSaving(true);
    try {
      const payload = businessHours
        .map((entry) => ({
          day: entry.day,
          openTime: entry.openTime,
          closeTime: entry.closeTime,
          isOpen: entry.isOpen
        }))
        .sort((a, b) => a.day - b.day);

      const updated = await apiRequest<TenantRecord>(`/tenants/${tenant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ businessHours: payload })
      });
      setTenant(updated);
      setHoursSuccess(true);
      window.setTimeout(() => setHoursSuccess(false), 2500);
    } catch (err: any) {
      setHoursError(err.message || 'No se pudo guardar los horarios');
    } finally {
      setHoursSaving(false);
    }
  };

  const handleSaveBrand = async () => {
    if (!tenant?.id) return;
    setBrandError(null);
    setBrandSuccess(false);
    setBrandSaving(true);
    try {
      const updated = await apiRequest<TenantRecord>(`/tenants/${tenant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          primaryColor,
          secondaryColor,
          customColors: {
            primary: primaryColor,
            secondary: secondaryColor
          }
        })
      });
      setTenant(updated);
      setBrandSuccess(true);
      window.setTimeout(() => setBrandSuccess(false), 2500);
    } catch (err: any) {
      setBrandError(err.message || 'No se pudo guardar los colores');
    } finally {
      setBrandSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="app-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Control operativo</h2>
            <p className="section-subtitle">Agenda viva, equipo y comunicaciones en un solo lugar.</p>
          </div>
          <button className="btn-secondary" type="button" onClick={handleCopy}>
            {copied ? 'URL copiada' : 'Compartir URL publica'}
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        {showPos || showStorefront ? (
          <div className="app-card">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Ventas totales</p>
            <p className="mt-4 text-3xl font-semibold">$ {summary.totalSales}</p>
            <p className="mt-2 text-sm text-muted">Consolidado del mes.</p>
          </div>
        ) : null}
        {showAgenda ? (
          <div className="app-card">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Citas de hoy</p>
            <p className="mt-4 text-3xl font-semibold">{summary.appointmentsToday}</p>
            <p className="mt-2 text-sm text-muted">Agenda activa.</p>
          </div>
        ) : null}
        {showInventory ? (
          <div className="app-card">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Total de productos</p>
            <p className="mt-4 text-3xl font-semibold">{summary.totalProducts}</p>
            <p className="mt-2 text-sm text-muted">Catalogo disponible.</p>
          </div>
        ) : null}
        {showStaff ? (
          <div className="app-card">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{labels.staffPlural} activos</p>
            <p className="mt-4 text-3xl font-semibold">{summary.activeStaff}</p>
            <p className="mt-2 text-sm text-muted">Equipo operativo.</p>
          </div>
        ) : null}
      </div>

      {showPos || showStorefront ? (
        <div className="app-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Tendencia de ventas</h3>
              <p className="text-sm text-muted">Ultimos 7 dias</p>
            </div>
          </div>
          {salesChartData.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Sin datos de ventas recientes.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} />
                  <YAxis stroke="var(--muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 17, 24, 0.92)',
                      border: '1px solid rgba(248,250,252,0.12)',
                      borderRadius: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : null}

      <div className="app-card">
        <h3 className="text-lg font-semibold">Identidad del negocio</h3>
        <p className="mt-2 text-sm text-muted">Sube tu logo para personalizar la experiencia.</p>
        {logoError ? <p className="mt-3 text-sm text-secondary">{logoError}</p> : null}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {tenant?.logoUrl ? (
            <img src={tenant.logoUrl} alt="Logo" className="h-16 w-16 rounded-2xl object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-2xl border border-white/10 bg-white/5" />
          )}
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-[0.2em] text-muted">Subir logo</span>
            <input
              className="input-field mt-2"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              disabled={logoUploading}
            />
          </label>
        </div>
      </div>

      <div className="app-card">
        <h3 className="text-lg font-semibold">Paleta de marca</h3>
        <p className="mt-2 text-sm text-muted">Define el color de acento y el resplandor del tenant.</p>
        {brandError ? <p className="mt-3 text-sm text-secondary">{brandError}</p> : null}
        {brandSuccess ? <p className="mt-3 text-sm text-primary">Colores guardados.</p> : null}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-xs text-muted">
            Color de acento principal
            <input
              className="input-field mt-2 h-12 cursor-pointer border border-[#00F0FF]/40 bg-transparent p-2"
              type="color"
              value={primaryColor}
              onChange={(event) => setPrimaryColor(event.target.value)}
            />
          </label>
          <label className="text-xs text-muted">
            Color de resplandor
            <input
              className="input-field mt-2 h-12 cursor-pointer border border-[#8A2BE2]/40 bg-transparent p-2"
              type="color"
              value={secondaryColor}
              onChange={(event) => setSecondaryColor(event.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-primary" type="button" onClick={handleSaveBrand} disabled={brandSaving}>
            {brandSaving ? 'Guardando...' : 'Guardar colores'}
          </button>
        </div>
      </div>

      <div className="app-card">
        <h3 className="text-lg font-semibold">Horarios de atencion</h3>
        <p className="mt-2 text-sm text-muted">Define los dias laborables y su rango de apertura.</p>
        {hoursError ? <p className="mt-3 text-sm text-secondary">{hoursError}</p> : null}
        {hoursSuccess ? <p className="mt-3 text-sm text-primary">Horarios guardados.</p> : null}
        <div className="mt-4">
          <BusinessHoursSettings value={businessHours} onChange={setBusinessHours} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-primary" type="button" onClick={handleSaveHours} disabled={hoursSaving}>
            {hoursSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <PlanGuard requiredPlan="PRO">
        <div className="app-card">
          <h3 className="text-lg font-semibold">Optimización inteligente</h3>
          <p className="mt-2 text-sm text-muted">
            Sugerencias automaticas de slots para maximizar revenue.
          </p>
        </div>
      </PlanGuard>
    </section>
  );
}
