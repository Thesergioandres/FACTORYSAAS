import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../shared/infrastructure/http/apiClient';
import type { TenantRecord } from '../../shared/context/TenantContext';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
};

type TenantPublicHomeProps = {
  tenant: TenantRecord | null;
};

export function TenantPublicHome({ tenant }: TenantPublicHomeProps) {
  const activeModules = tenant?.activeModules || [];
  const hasAgenda = activeModules.includes('agenda');
  const hasInventory = activeModules.includes('inventory');

  const productsQuery = useQuery({
    queryKey: ['inventory', 'public', tenant?.id],
    queryFn: () => apiRequest<Product[]>(`/inventory/public?tenantId=${tenant?.id}`),
    enabled: Boolean(tenant?.id) && hasInventory && !hasAgenda
  });

  const products = useMemo(() => productsQuery.data || [], [productsQuery.data]);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('.reveal-on-scroll')) as HTMLElement[];
    if (elements.length === 0) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.2 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [tenant?.id]);

  if (hasAgenda) {
    return (
      <section className="space-y-6 bg-app text-app-text p-6 rounded-3xl">
        <header className="app-card reveal-on-scroll">
          <div className="flex flex-wrap items-center gap-3">
            {tenant?.logoUrl ? (
              <img
                alt={tenant.name || 'Logo'}
                className="h-12 w-12 rounded-2xl object-cover"
                src={tenant.logoUrl}
              />
            ) : null}
            <div>
              <p className="app-chip">{tenant?.name || 'Tu negocio'}</p>
              <h2 className="mt-3 text-3xl font-semibold brand-gradient-text">
                Portal de reservas
              </h2>
              <p className="mt-2 text-sm text-muted">Agenda tu servicio en segundos.</p>
            </div>
          </div>
        </header>

        <div className="app-card reveal-on-scroll">
          <h3 className="text-lg font-semibold brand-gradient-text">
            Comienza tu reserva
          </h3>
          <p className="mt-2 text-sm text-muted">Selecciona servicio, staff y horario disponible.</p>
          <Link className="btn-primary mt-6" to="/booking">
            Reservar ahora
          </Link>
        </div>
      </section>
    );
  }

  if (hasInventory) {
    return (
      <section className="space-y-6 bg-app text-app-text p-6 rounded-3xl">
        <header className="app-card reveal-on-scroll">
          <div className="flex flex-wrap items-center gap-3">
            {tenant?.logoUrl ? (
              <img
                alt={tenant.name || 'Logo'}
                className="h-12 w-12 rounded-2xl object-cover"
                src={tenant.logoUrl}
              />
            ) : null}
            <div>
              <p className="app-chip">{tenant?.name || 'Tu negocio'}</p>
              <h2 className="mt-3 text-3xl font-semibold brand-gradient-text">
                Catalogo disponible
              </h2>
              <p className="mt-2 text-sm text-muted">Productos destacados y stock actualizado.</p>
            </div>
          </div>
        </header>

        {productsQuery.isLoading ? (
          <p className="text-sm text-muted">Cargando catalogo...</p>
        ) : productsQuery.isError ? (
          <p className="text-sm text-secondary">No se pudo cargar el catalogo.</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted">No hay productos disponibles en este momento.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div key={product.id} className="app-card-soft flex flex-col gap-3 mirror-card hover-lift reveal-on-scroll">
                <div className="h-36 w-full overflow-hidden rounded-2xl bg-black/20">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-muted">{product.category}</p>
                  </div>
                  <span className="text-sm font-semibold">$ {product.price}</span>
                </div>
                <p className="text-xs text-muted">Stock disponible: {product.stock}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="app-card">
      <h2 className="section-title">Tu portal esta en construccion</h2>
      <p className="section-subtitle">Activa modulos para habilitar reservas o catalogo.</p>
    </section>
  );
}
