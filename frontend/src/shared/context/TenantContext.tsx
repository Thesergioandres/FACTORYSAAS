import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../infrastructure/http/apiClient';
import { useAuth } from './AuthContext';
import { resolveHostContext } from '../utils/host';
import { VERTICALS_REGISTRY } from '../constants/verticalsRegistry';
import type { BusinessHour } from '../utils/businessHours';

export type TenantRecord = {
  id: string;
  name: string;
  slug: string;
  verticalSlug?: string;
  planId?: string;
  planName?: string;
  activeModules?: string[];
  subdomain?: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  customColors?: {
    primary?: string;
    secondary?: string;
  };
  logoUrl?: string | null;
  status?: string;
  businessHours?: BusinessHour[];
};

type TenantContextValue = {
  tenant: TenantRecord | null;
  loading: boolean;
  setTenant: (tenant: TenantRecord | null) => void;
  loadTenantBySlug: (slug: string) => Promise<void>;
};

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tenant, setTenantState] = useState<TenantRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const injectBrandColors = useCallback((nextTenant: TenantRecord | null) => {
    const root = document.documentElement;
    const fallbackPrimary = '#00F0FF';
    const fallbackSecondary = '#8A2BE2';
    const primary = nextTenant?.primaryColor
      || nextTenant?.customColors?.primary
      || fallbackPrimary;
    const secondary = nextTenant?.secondaryColor
      || nextTenant?.customColors?.secondary
      || fallbackSecondary;

    root.style.setProperty('--primary', primary);
    root.style.setProperty('--secondary', secondary);
    root.style.setProperty('--glow-primary', `${primary}73`);
    root.style.setProperty('--glow-secondary', `${secondary}73`);
  }, []);

  const applyBranding = useCallback((nextTenant: TenantRecord | null) => {
    const root = document.documentElement;
    const verticalSlug = (nextTenant?.verticalSlug || '').toLowerCase();
    const verticalTheme = VERTICALS_REGISTRY.find((item) => item.slug === verticalSlug)?.theme;
    const background = verticalTheme?.background || '#0f1118';
    const text = verticalTheme?.text || '#f8fafc';
    const logoUrl = nextTenant?.logoUrl ? `url("${nextTenant.logoUrl}")` : 'none';

    root.style.setProperty('--bg-app', background);
    root.style.setProperty('--text-app', text);
    root.style.setProperty('--logo-url', logoUrl);
    document.title = nextTenant?.name ? `${nextTenant.name} - ESSENCE FACTORY SAAS` : 'ESSENCE FACTORY SAAS';
    injectBrandColors(nextTenant);
  }, [injectBrandColors]);

  // Auto-resolve tenant for ADMIN/OWNER or STAFF roles based on their tied tenantId
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'OWNER' || user.role === 'STAFF') && user.tenantId && !tenant) {
      setLoading(true);
      apiRequest<TenantRecord>(`/tenants/${user.tenantId}`)
        .then((data) => {
          setTenantState(data);
          applyBranding(data);
        })
        .catch(() => setTenantState(null))
        .finally(() => setLoading(false));
    }
  }, [user, tenant, applyBranding]);

  const setTenant = useCallback((t: TenantRecord | null) => {
    setTenantState(t);
    applyBranding(t);
  }, [applyBranding]);

  const loadTenantBySlug = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      const preview = await apiRequest<TenantRecord>(`/tenants/slug/${slug}`);
      const data = preview?.id ? await apiRequest<TenantRecord>(`/tenants/${preview.id}`) : preview;
      setTenantState(data);
      applyBranding(data);
    } catch (_err) {
      setTenantState(null);
    } finally {
      setLoading(false);
    }
  }, [applyBranding]);

  useEffect(() => {
    const { mode, slug } = resolveHostContext(window.location.hostname);

    if (mode === 'tenant' && slug && !tenant) {
      loadTenantBySlug(slug);
      return;
    }

    if (mode !== 'tenant') {
      applyBranding(null);
    }
  }, [tenant, loadTenantBySlug, applyBranding]);

  const value = useMemo(() => ({ tenant, loading, setTenant, loadTenantBySlug }), [tenant, loading, setTenant, loadTenantBySlug]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}
