import { useEffect, useMemo, useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { VERTICALS_REGISTRY } from '../../shared/constants/verticalsRegistry';
import { gsap } from '../../shared/animations/gsapConfig';
import { EssenceMicroSymbol } from '../../shared/components/EssenceMicroSymbol';
import { DynamicHero } from './components/DynamicHero';

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
  const baseChipsRef = useRef<HTMLDivElement | null>(null);
  const { slug, verticalId } = useParams();
  const vertical = useMemo(() => {
    const resolved = slug || verticalId;
    return VERTICALS_REGISTRY.find((item) => item.slug === resolved);
  }, [slug, verticalId]);

  const theme = useMemo(() => {
    return (
      vertical?.theme ?? {
        primary: '#00F0FF',
        secondary: '#8A2BE2'
      }
    );
  }, [vertical]);

  const safeSecondary = useMemo(() => {
    const normalized = theme.secondary.trim().toUpperCase();
    if (normalized === '#FFFFFF' || normalized === '#FDFEFE') {
      return '#E6EEF5';
    }
    return theme.secondary;
  }, [theme.secondary]);

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
    const primaryRgb = theme.primary
      .replace('#', '')
      .match(/.{1,2}/g)
      ?.map((value) => Number.parseInt(value, 16))
      .join(', ') ?? '0, 240, 255';
    gsap.to(document.documentElement, {
      '--primary': theme.primary,
      '--secondary': safeSecondary,
      '--primary-glow': `${theme.primary}33`,
      '--primary-rgb': primaryRgb,
      duration: 0.5,
      ease: 'power1.out'
    });
  }, [theme.primary, safeSecondary]);

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
    return <Navigate to="/404" replace />;
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

  const features = vertical.features ?? [];
  const baseModules = vertical.baseModules ?? [];
  const moduleLabelMap: Record<string, string> = {
    agenda: 'Agenda',
    staff: 'Staff',
    inventory: 'Inventario',
    pos: 'POS',
    projects: 'Proyectos'
  };

  const baseModuleIcons: Record<string, string> = {
    agenda:
      'M8 7V3M16 7V3M4 11h16M6 7h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z',
    staff:
      'M16 19a4 4 0 0 0-8 0M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm7 4.5a3.5 3.5 0 0 0-3-3',
    inventory:
      'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
    pos:
      'M3 7h18M5 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7M8 11h3M8 15h3M13 11h3M13 15h3',
    projects:
      'M3 3h18v18H3V3zm4 4h10M7 12h10M7 16h6'
  };

  useEffect(() => {
    if (!baseChipsRef.current) return;
    const chips = Array.from(baseChipsRef.current.querySelectorAll('[data-base-chip]')) as HTMLElement[];
    if (chips.length === 0) return;
    const tween = gsap.fromTo(
      chips,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.25,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.1
      }
    );
    return () => tween.kill();
  }, [vertical.slug]);

  return (
    <section
      className="space-y-16"
      style={
        {
          '--primary': theme.primary,
          '--secondary': safeSecondary,
          '--primary-glow': `${theme.primary}33`,
          '--primary-rgb': theme.primary
            .replace('#', '')
            .match(/.{1,2}/g)
            ?.map((value) => Number.parseInt(value, 16))
            .join(', ')
        } as React.CSSProperties
      }
    >
      <div className="reveal-on-scroll">
        <DynamicHero verticalId={vertical.slug} verticalName={vertical.name} />
      </div>
      <div className="app-card relative overflow-hidden p-10 reveal-on-scroll">
        {isReady ? (
          <div
            className="absolute -right-24 -top-24 h-64 w-64 rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(circle at 40% 40%, var(--primary-glow), transparent 65%)'
            }}
          />
        ) : null}
        <p className="app-chip">Solucion integral</p>
        <h1 className="mt-6 text-4xl font-semibold md:text-5xl brand-gradient-text">
          Solucion Integral para {vertical.name}
        </h1>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-muted">
            <EssenceMicroSymbol size={18} />
            Infraestructura base
          </div>
          <div ref={baseChipsRef} className="flex flex-wrap gap-2">
            {baseModules.map((module) => {
              const label = moduleLabelMap[module] || module;
              const iconPath = baseModuleIcons[module] || baseModuleIcons.projects;
              return (
                <span
                  key={module}
                  data-base-chip
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.3em] transition-transform duration-200 hover:-translate-y-0.5"
                  aria-label={`Infraestructura base: ${label}`}
                  style={{
                    borderColor: 'var(--primary)',
                    color: 'var(--primary)',
                    background: 'rgba(var(--primary-rgb), 0.1)'
                  }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d={iconPath} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {label}
                </span>
              );
            })}
          </div>
        </div>
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

      <div className="space-y-6 reveal-on-scroll">
        <div className="flex flex-wrap items-center gap-3">
          <EssenceMicroSymbol size={22} />
          <div>
            <h2 className="text-2xl font-semibold brand-gradient-text">Capacidades de la fabrica</h2>
            <p className="mt-2 text-sm text-muted">
              Funciones exclusivas diseñadas para tu vertical.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const isOnDemand = feature.toLowerCase().includes('bajo demanda');
            return (
              <div
                key={feature}
                className="rounded-3xl border border-[rgba(138,43,226,0.25)] bg-[#0b1224]/60 p-5 backdrop-blur-[18px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border"
                    style={{ borderColor: 'var(--primary)', opacity: 0.7 }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                  </span>
                  {isOnDemand ? (
                    <span
                      className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.25em]"
                      style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                    >
                      Bajo demanda
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm text-muted">{feature}</p>
              </div>
            );
          })}
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
