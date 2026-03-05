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
  phone?: string | null;
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
    const rawPrimary = nextTenant?.primaryColor || nextTenant?.customColors?.primary || fallbackPrimary;
    const rawSecondary = nextTenant?.secondaryColor || nextTenant?.customColors?.secondary || fallbackSecondary;
    const isValidColor = (value: string) => {
      if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
        return CSS.supports('color', value);
      }
      return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
    };
    const primary = isValidColor(rawPrimary) ? rawPrimary : fallbackPrimary;
    const secondary = isValidColor(rawSecondary) ? rawSecondary : fallbackSecondary;

    root.style.setProperty('--primary', primary);
    root.style.setProperty('--secondary', secondary);
    root.style.setProperty('--glow-primary', isValidColor(`${primary}73`) ? `${primary}73` : 'rgba(0, 240, 255, 0.45)');
    root.style.setProperty('--glow-secondary', isValidColor(`${secondary}73`) ? `${secondary}73` : 'rgba(138, 43, 226, 0.45)');
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
      const controller = new AbortController();
      let active = true;
      setLoading(true);
      apiRequest<TenantRecord>(`/tenants/${user.tenantId}`, { signal: controller.signal })
        .then((data) => {
          if (!active) return;
          setTenantState(data);
          applyBranding(data);
        })
        .catch(() => {
          if (!active) return;
          setTenantState(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
        controller.abort();
      };
    }
    return undefined;
  }, [user, tenant, applyBranding]);

  const setTenant = useCallback((t: TenantRecord | null) => {
    setTenantState(t);
    applyBranding(t);
  }, [applyBranding]);

  const loadTenantBySlug = useCallback(async (slug: string, signal?: AbortSignal) => {
    try {
      setLoading(true);
      const preview = await apiRequest<TenantRecord>(`/tenants/slug/${slug}`, { signal });
      const data = preview?.id
        ? await apiRequest<TenantRecord>(`/tenants/${preview.id}`, { signal })
        : preview;
      if (signal?.aborted) return;
      setTenantState(data);
      applyBranding(data);
    } catch (_err) {
      if (!signal?.aborted) {
        setTenantState(null);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [applyBranding]);

  useEffect(() => {
    const { mode, slug } = resolveHostContext(window.location.hostname);
    const controller = new AbortController();

    if (mode === 'tenant' && slug && !tenant) {
      loadTenantBySlug(slug, controller.signal);
      return () => controller.abort();
    }

    if (mode !== 'tenant') {
      applyBranding(null);
    }
    return () => controller.abort();
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
