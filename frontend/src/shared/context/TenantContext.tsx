import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../infrastructure/http/apiClient';
import { useAuth } from './AuthContext';

export type TenantRecord = {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
  };
  logoUrl?: string | null;
  status?: string;
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

  const applyBranding = useCallback((nextTenant: TenantRecord | null) => {
    const root = document.documentElement;
    const primary = nextTenant?.customColors?.primary || '#f59e0b';
    const secondary = nextTenant?.customColors?.secondary || '#fde68a';

    const toRgb = (hex: string) => {
      const normalized = hex.replace('#', '').trim();
      if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        return null;
      }
      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      return `${r} ${g} ${b}`;
    };

    const primaryRgb = toRgb(primary);
    const secondaryRgb = toRgb(secondary);
    if (primaryRgb) {
      root.style.setProperty('--tenant-primary', primaryRgb);
      root.style.setProperty('--accent', primaryRgb);
    }
    if (secondaryRgb) {
      root.style.setProperty('--tenant-secondary', secondaryRgb);
    }
  }, []);

  // Auto-resolve tenant for ADMIN or BARBER roles based on their tied tenantId
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'BARBER') && user.tenantId && !tenant) {
      setLoading(true);
      apiRequest<{ id: string; name: string; slug: string }>(`/tenants/${user.tenantId}`)
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
      const data = await apiRequest<TenantRecord>(`/tenants/slug/${slug}`);
      setTenantState(data);
      applyBranding(data);
    } catch (_err) {
      setTenantState(null);
    } finally {
      setLoading(false);
    }
  }, [applyBranding]);

  useEffect(() => {
    const host = window.location.hostname;
    const segments = host.split('.');
    const hasSubdomain = segments.length > 1 && host !== 'localhost';
    const localSubdomain = host.endsWith('localhost') && segments.length > 1;
    const slug = hasSubdomain || localSubdomain ? segments[0] : null;

    if (slug && !tenant) {
      loadTenantBySlug(slug);
    }
  }, [tenant, loadTenantBySlug]);

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
