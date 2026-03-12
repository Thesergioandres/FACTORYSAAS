import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../shared/infrastructure/http/apiClient';

type PublicTenantProfile = {
  id: string;
  verticalSlug: string;
  businessProfile: {
    slug: string;
    name: string;
    phone: string;
    address: string;
    logoUrl: string;
    primaryColor: string;
  };
};

const mockTenants: Record<string, PublicTenantProfile> = {
  'tattoos:ink-master-bogota': {
    id: 'mock_ink_master',
    verticalSlug: 'tattoos',
    businessProfile: {
      slug: 'ink-master-bogota',
      name: 'Ink Master Bogota',
      phone: '+57 300 123 0000',
      address: 'Zona T, Bogota, Colombia',
      logoUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=160&q=80',
      primaryColor: '#0EA5E9'
    }
  }
};

function isHexColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function PublicTenantLanding() {
  const { verticalSlug = '', tenantSlug = '' } = useParams();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tenant, setTenant] = useState<PublicTenantProfile | null>(null);

  const cacheKey = `${verticalSlug}:${tenantSlug}`;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    apiRequest<PublicTenantProfile>(`/tenants/public/${verticalSlug}/${tenantSlug}`)
      .then((payload) => {
        if (!active) return;
        setTenant(payload);
      })
      .catch(() => {
        if (!active) return;
        const fallback = mockTenants[cacheKey];
        if (fallback) {
          setTenant(fallback);
          return;
        }
        setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [verticalSlug, tenantSlug, cacheKey]);

  const brandColor = useMemo(() => {
    const value = tenant?.businessProfile.primaryColor || '#00F0FF';
    return isHexColor(value) ? value : '#00F0FF';
  }, [tenant?.businessProfile.primaryColor]);

  useEffect(() => {
    if (!tenant) return;
    const root = document.documentElement;
    const previousPrimary = root.style.getPropertyValue('--primary');
    const previousSecondary = root.style.getPropertyValue('--secondary');
    const previousGlow = root.style.getPropertyValue('--primary-glow');

    root.style.setProperty('--primary', brandColor);
    root.style.setProperty('--secondary', '#ffffff');
    root.style.setProperty('--primary-glow', `${brandColor}33`);

    return () => {
      root.style.setProperty('--primary', previousPrimary || '#00F0FF');
      root.style.setProperty('--secondary', previousSecondary || '#8A2BE2');
      root.style.setProperty('--primary-glow', previousGlow || 'rgba(0, 240, 255, 0.15)');
    };
  }, [tenant, brandColor]);

  if (loading) {
    return <section className="app-card">Cargando marca...</section>;
  }

  if (notFound || !tenant) {
    return <Navigate to="/404" replace />;
  }

  return (
    <section className="space-y-8">
      <header
        className="app-card relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${brandColor}22, rgba(8, 12, 24, 0.82) 52%)`
        }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="app-chip">{verticalSlug.toUpperCase()}</p>
            <h1 className="text-4xl font-semibold md:text-5xl">{tenant.businessProfile.name}</h1>
            <p className="max-w-2xl text-sm text-muted">
              Agenda tu cita o visita nuestra sede. Esta landing es white-label y se adapta al branding del negocio.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border px-4 py-2" style={{ borderColor: 'var(--outline)' }}>
                {tenant.businessProfile.phone}
              </span>
              <span className="rounded-full border px-4 py-2" style={{ borderColor: 'var(--outline)' }}>
                {tenant.businessProfile.address}
              </span>
            </div>
          </div>
          {tenant.businessProfile.logoUrl ? (
            <div className="h-24 w-24 overflow-hidden rounded-2xl border bg-black/20 p-2" style={{ borderColor: 'var(--outline)' }}>
              <img src={tenant.businessProfile.logoUrl} alt={tenant.businessProfile.name} className="h-full w-full object-cover" />
            </div>
          ) : null}
        </div>
      </header>

      <main className="app-card">
        <h2 className="text-2xl font-semibold">Experiencia de marca personalizada</h2>
        <p className="mt-3 text-sm text-muted">
          El color principal de botones, acentos y highlights ahora usa el `primaryColor` del perfil del tenant en tiempo real.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" type="button">Reservar cita</button>
          <button className="btn-secondary" type="button">Ver servicios</button>
        </div>
      </main>

      <footer className="app-card text-sm text-muted">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <span>{tenant.businessProfile.name}</span>
          <span>{tenant.businessProfile.phone}</span>
          <span>{tenant.businessProfile.address}</span>
        </div>
      </footer>
    </section>
  );
}
