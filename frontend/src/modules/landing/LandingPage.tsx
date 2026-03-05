import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { VERTICALS_REGISTRY } from '../../shared/constants/verticalsRegistry';
import { AboutSection } from './components/AboutSection';

function setSeo(title: string, description: string) {
  document.title = title;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', description);
}

export function LandingPage() {
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('Todos');

  useEffect(() => {
    setSeo(
      'Essence Factory | Plataforma SaaS White-Label',
      'Construimos el motor de tu negocio. Infraestructura SaaS white-label para verticales con marca propia, control total y expansion rapida.'
    );
  }, []);

  const filterOptions = ['Todos', 'Belleza', 'Salud', 'Retail', 'Logistica', 'Profesionales'];
  const readySlugs = new Set(['barberias']);

  const categoryForSlug = (slug: string) => {
    const keywordMap: Record<string, string[]> = {
      Belleza: ['barberias', 'salones', 'estetica', 'spas', 'depilacion', 'belleza'],
      Salud: ['clinicas', 'odontologia', 'psicologia', 'veterinarias', 'farmacias', 'opticas', 'salud'],
      Retail: ['tiendas', 'inventarios', 'ferreterias', 'papelerias', 'regalos', 'floristerias', 'conveniencia'],
      Logistica: ['logistica', 'transporte', 'envios', 'almacen', 'bodega', 'mensajeria', 'delivery', 'courier'],
      Profesionales: ['abogados', 'contables', 'consultoria', 'consultorias', 'agencias', 'estudios', 'despachos']
    };

    const match = Object.entries(keywordMap).find(([, keywords]) => keywords.some((keyword) => slug.includes(keyword)));
    return match ? match[0] : 'Profesionales';
  };

  const moduleLabelMap: Record<string, string> = {
    agenda: 'Agenda',
    pos: 'POS',
    inventory: 'Inventario',
    staff: 'Staff',
    services: 'Servicios',
    subscriptions: 'Suscripciones',
    accounting: 'Finanzas',
    tables: 'Mesas',
    digital_menu: 'Menu',
    kitchen_display: 'Cocina',
    access_control: 'Acceso',
    progress_tracking: 'Progreso',
    assets_management: 'Activos',
    tasks: 'Tareas',
    projects: 'Proyectos',
    contracts: 'Contratos',
    commissions: 'Comisiones'
  };

  const formatModules = (modules: string[]) => {
    const labels = modules.map((module) => moduleLabelMap[module] || module).filter(Boolean);
    return labels.slice(0, 2).join(' + ');
  };

  const filteredVerticals = useMemo(() => {
    if (activeFilter === 'Todos') {
      return VERTICALS_REGISTRY;
    }
    return VERTICALS_REGISTRY.filter((vertical) => categoryForSlug(vertical.slug) === activeFilter);
  }, [activeFilter]);

  return (
    <section className="space-y-16 pt-10 md:pt-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="app-card p-8 md:p-10">
          <p className="app-chip font-sans tracking-[0.35em]">The factory hub</p>
          <h2 className="mt-6 text-5xl font-semibold leading-tight md:text-6xl">
            {t('landing.heroTitle')}
          </h2>
          <p className="mt-5 text-sm text-muted">
            {t('landing.heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/barberias-landing">
              {t('landing.ctaExplore')}
            </Link>
            <Link className="btn-secondary" to="#quienes-somos">
              {t('landing.ctaAbout')}
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-[rgba(138,43,226,0.35)] bg-[#0b1224]/70 p-6 shadow-[0_24px_60px_rgba(3,6,18,0.6)] backdrop-blur-[24px]">
            <h3 className="text-lg font-semibold">Arquitectura white-label</h3>
            <p className="mt-2 text-sm text-muted">
              Rutas, permisos y branding por tenant con micro-frontends logicos para escalar sin fricciones.
            </p>
          </div>
          <div className="rounded-3xl border border-[rgba(138,43,226,0.35)] bg-[#0b1224]/70 p-6 shadow-[0_24px_60px_rgba(3,6,18,0.6)] backdrop-blur-[24px]">
            <h3 className="text-lg font-semibold">Operacion en tiempo real</h3>
            <p className="mt-2 text-sm text-muted">
              Reportes, automatizaciones y sincronizacion viva para equipos que no pueden parar.
            </p>
          </div>
        </div>
      </div>

      <AboutSection />

      <div className="app-card py-24">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">{t('landing.industriesTitle')}</h3>
            <p className="mt-2 text-sm text-muted">
              {t('landing.industriesSubtitle')}
            </p>
          </div>
          <Link className="btn-secondary" to="/barberias-landing">Ver detalle barberias</Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {filterOptions.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <button
                key={filter}
                className={
                  isActive
                    ? 'rounded-full border border-[rgba(0,240,255,0.6)] bg-[rgba(0,240,255,0.12)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-primary'
                    : 'rounded-full border border-[rgba(138,43,226,0.35)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted transition hover:border-[rgba(0,240,255,0.6)] hover:text-primary'
                }
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVerticals.map((vertical) => {
            const isReady = readySlugs.has(vertical.slug);
            return (
              <Link
                key={vertical.slug}
                to={`/landing/${vertical.slug}`}
                className="group relative min-h-[190px] rounded-[24px] border border-[rgba(138,43,226,0.35)] bg-[#0b1224] p-6 transition hover:border-[rgba(0,240,255,0.8)]"
              >
                {isReady ? (
                  <span className="inline-flex items-center rounded-full border border-[rgba(0,240,255,0.5)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-primary">
                    Listo para operar
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-[rgba(138,43,226,0.3)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-muted">
                    Bajo demanda
                  </span>
                )}
                <h4 className="mt-4 text-lg font-semibold text-ink">{vertical.name}</h4>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted">
                  {formatModules(vertical.activeModules)}
                </p>
                <p className="mt-4 text-sm text-muted">Explora la fabrica con rutas y permisos listos.</p>
              </Link>
            );
          })}
        </div>
      </div>

      <footer className="app-card-soft flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">{t('landing.footerLanguage')}</p>
        <div className="flex items-center gap-2">
          <button
            className={`btn-ghost ${i18n.language === 'es' ? 'text-primary' : ''}`}
            type="button"
            onClick={() => i18n.changeLanguage('es')}
          >
            ES
          </button>
          <button
            className={`btn-ghost ${i18n.language === 'en' ? 'text-primary' : ''}`}
            type="button"
            onClick={() => i18n.changeLanguage('en')}
          >
            EN
          </button>
        </div>
      </footer>
    </section>
  );
}
