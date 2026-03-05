import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { VERTICALS_REGISTRY } from '../../shared/constants/verticalsRegistry';

const MODULE_DEFINITIONS: Record<string, { label: string; description: string }> = {
  agenda: {
    label: 'Agenda inteligente',
    description: 'Reserva y gestiona citas con confirmaciones automaticas.'
  },
  pos: {
    label: 'POS integrado',
    description: 'Cobra ventas con control de caja y reportes diarios.'
  },
  inventory: {
    label: 'Inventario vivo',
    description: 'Stock sincronizado con compras, ventas y alertas.'
  },
  staff: {
    label: 'Equipo coordinado',
    description: 'Roles, comisiones y turnos en una sola vista.'
  },
  services: {
    label: 'Servicios premium',
    description: 'Catalogo editable con precios y duraciones.'
  },
  subscriptions: {
    label: 'Suscripciones',
    description: 'Planes recurrentes y renovaciones automaticas.'
  },
  accounting: {
    label: 'Finanzas claras',
    description: 'Ingresos, egresos y reportes consolidados.'
  },
  tables: {
    label: 'Mesas y flujo',
    description: 'Controla servicio y ocupacion en tiempo real.'
  },
  digital_menu: {
    label: 'Menu digital',
    description: 'Carta interactiva para pedidos sin friccion.'
  },
  kitchen_display: {
    label: 'Cocina conectada',
    description: 'Comandas en pantalla y tiempos controlados.'
  },
  access_control: {
    label: 'Control de acceso',
    description: 'Ingresos, membresias y puertas seguras.'
  },
  progress_tracking: {
    label: 'Progreso continuo',
    description: 'Seguimiento de avances y metas del cliente.'
  },
  assets_management: {
    label: 'Activos protegidos',
    description: 'Equipos y recursos monitoreados.'
  },
  tasks: {
    label: 'Tareas y checklists',
    description: 'Operacion diaria con responsables claros.'
  },
  projects: {
    label: 'Proyectos',
    description: 'Briefs, entregables y tiempos controlados.'
  },
  contracts: {
    label: 'Contratos',
    description: 'Documentos y aprobaciones centralizadas.'
  },
  commissions: {
    label: 'Liquidacion automatica',
    description: 'Calcula y gestiona los pagos de tu equipo por cada servicio o venta realizada.'
  },
  order_management: {
    label: 'Centro de pedidos',
    description: 'Centraliza tus ventas fisicas, online y domicilios en una sola pantalla inteligente.'
  },
  shipping_tracking: {
    label: 'Logistica y rastreo',
    description: 'Gestiona despachos y permite que tus clientes sigan su pedido en tiempo real.'
  },
  multi_vendor: {
    label: 'Ecosistema marketplace',
    description: 'Permite que multiples vendedores operen en tu plataforma bajo tu control.'
  },
  ecommerce_storefront: {
    label: 'Vitrina global',
    description: 'Tu negocio abierto al mundo 24/7 con diseno de alta conversion.'
  }
};

export function VerticalLandingPage() {
  const { slug } = useParams();
  const vertical = useMemo(() => {
    return VERTICALS_REGISTRY.find((item) => item.slug === slug);
  }, [slug]);

  useEffect(() => {
    if (!vertical) return;
    const title = `Essence Factory | Solucion para ${vertical.name}`;
    const description = `Lanza tu propia plataforma de ${vertical.name} en minutos con marca blanca y control total.`;
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [vertical]);

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
  }, [vertical]);

  if (!vertical) {
    return (
      <section className="app-card">
        <h2 className="section-title">Vertical no encontrada</h2>
        <p className="section-subtitle">Explora nuestras soluciones y vuelve a intentarlo.</p>
        <div className="mt-6">
          <Link className="btn-secondary" to="/">Volver al inicio</Link>
        </div>
      </section>
    );
  }

  const isReady = vertical.slug === 'barberias';
  const modules = vertical.activeModules.map((module) => {
    const definition = MODULE_DEFINITIONS[module];
    return {
      key: module,
      label: definition?.label || module.replace(/_/g, ' '),
      description: definition?.description || 'Capacidad operativa personalizada para tu vertical.'
    };
  });

  return (
    <section className="space-y-16">
      <div className="app-card relative overflow-hidden p-10 reveal-on-scroll">
        {isReady ? (
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(0,240,255,0.7),transparent_65%)] blur-2xl" />
        ) : null}
        <p className="app-chip">Solucion integral</p>
        <h1 className="mt-6 text-4xl font-semibold md:text-5xl brand-gradient-text">
          Solucion Integral para {vertical.name}
        </h1>
        <p className="mt-4 text-sm text-muted">
          Operacion completa, branding a medida y automatizaciones diseñadas para crecer sin friccion.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link className="btn-primary" to={`/onboarding?vertical=${vertical.slug}`}>
            Lanzar mi {vertical.name} ahora
          </Link>
          {isReady ? (
            <span className="inline-flex items-center rounded-full border border-[rgba(0,240,255,0.5)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-primary">
              Listo para operar
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-[rgba(138,43,226,0.35)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted">
              Bajo demanda
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6 reveal-on-scroll">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold brand-gradient-text">
              Modulos incluidos
            </h2>
            <p className="mt-2 text-sm text-muted">Diseñados para operar cada punto critico del negocio.</p>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted">
            {modules.length} modulos activos
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module.key}
              className="rounded-3xl border border-[rgba(138,43,226,0.35)] bg-[#0b1224]/70 p-6 backdrop-blur-[18px] mirror-card hover-lift reveal-on-scroll"
            >
              <h3 className="text-lg font-semibold text-ink">{module.label}</h3>
              <p className="mt-3 text-sm text-muted">{module.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="app-card flex flex-col items-start justify-between gap-6 md:flex-row md:items-center reveal-on-scroll">
        <div>
          <h2 className="text-2xl font-semibold brand-gradient-text">
            Lanza tu vertical con marca propia
          </h2>
          <p className="mt-2 text-sm text-muted">
            Activa tu entorno en minutos con la configuracion ideal para {vertical.name.toLowerCase()}.
          </p>
        </div>
        <Link className="btn-primary" to={`/onboarding?vertical=${vertical.slug}`}>
          Lanzar mi {vertical.name} ahora
        </Link>
      </div>
    </section>
  );
}
