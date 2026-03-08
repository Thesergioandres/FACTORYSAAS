import { Link, useLocation } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../../../shared/animations/gsapConfig';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useTenant } from '../../../../shared/context/TenantContext';
import { moduleRegistry } from '../../../../shared/constants/moduleRegistry';
import { setGoogleTranslateLanguage } from '../../../../shared/utils/googleTranslate';

const baseLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Usuarios' },
  { to: '/admin/services', label: 'Servicios' },
  { to: '/admin/appointments', label: 'Citas' },
  { to: '/admin/agenda', label: 'Agenda' },
  { to: '/admin/notifications', label: 'WhatsApp' },
  { to: '/admin/reports', label: 'Reportes' }
];

export function AdminNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const navRef = useRef<HTMLDivElement | null>(null);
  const activeModules = tenant?.activeModules || [];
  const staffAllowedModules = new Set(['agenda', 'inventory', 'pos', 'tables', 'kitchen_display']);
  const [activeLang, setActiveLang] = useState<'es' | 'en' | 'pt' | 'fr' | 'it' | 'de' | 'zh-CN'>('es');

  const godLinks = [
    { to: '/god', label: 'Dashboard Global' },
    { to: '/admin/tenants', label: 'Gestion de Tenants' },
    { to: '/admin/users', label: 'Usuarios Globales' },
    { to: '/admin/system', label: 'Configuracion del Sistema' }
  ];

  const staffLinks = Object.values(moduleRegistry)
    .filter((module) => module.adminPath && staffAllowedModules.has(module.key) && activeModules.includes(module.key))
    .map((module) => ({ to: module.adminPath as string, label: module.label }));

  const adminLinks = user?.role === 'GOD'
    ? godLinks
    : baseLinks;

  const links = user?.role === 'STAFF' ? staffLinks : adminLinks;

  const iconMap: Record<string, string> = {
      '/admin': 'M3 12h18M12 3l9 9v9a2 2 0 0 1-2 2h-5v-7h-4v7H5a2 2 0 0 1-2-2v-9z',
      '/admin/users': 'M3 18v-1a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v1M8 7a4 4 0 1 0 0.001-8.001A4 4 0 0 0 8 7zm8 0a4 4 0 1 0 0.001-8.001A4 4 0 0 0 16 7z',
      '/admin/services': 'M12 6v12M6 12h12M4 4h16v16H4z',
      '/admin/appointments': 'M8 3v4M16 3v4M4 8h16M6 12h4M6 16h6',
      '/admin/agenda': 'M4 5h16v14H4zM8 3v4M16 3v4',
      '/admin/notifications': 'M6 18h12M18 14V9a6 6 0 1 0-12 0v5l-2 2h16z',
      '/admin/reports': 'M4 19h16M7 16V9M12 16V5M17 16v-7',
      '/admin/tenants': 'M4 6h16M6 10h12M8 14h8M10 18h4',
      '/admin/approvals': 'M5 13l4 4L19 7',
      '/admin/system': 'M12 6V2m0 20v-4m8-8h4M2 12h4m12.95 5.95 2.83 2.83M4.22 4.22 7.05 7.05m0 9.9-2.83 2.83m14.14-14.14-2.83 2.83',
      '/god': 'M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z'
    };

  const mobileLinks = links.slice(0, 4);

  useGSAP(
    () => {
      gsap.from(navRef.current, {
        x: -24,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    },
    { scope: navRef }
  );

  return (
    <>
      <nav ref={navRef} className="app-nav-surface hidden flex-wrap gap-2 text-xs lg:flex">
          {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`app-navlink ${location.pathname === link.to ? 'app-navlink--active' : ''}`}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d={iconMap[link.to] || 'M5 12h14'} />
            </svg>
              {link.label}
          </Link>
        ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              className={`btn-ghost ${activeLang === 'es' ? 'text-primary' : ''}`}
              type="button"
              onClick={() => {
                setGoogleTranslateLanguage('es');
                setActiveLang('es');
              }}
            >
              Espanol
            </button>
            <button
              className={`btn-ghost ${activeLang === 'en' ? 'text-primary' : ''}`}
              type="button"
              onClick={() => {
                setGoogleTranslateLanguage('en');
                setActiveLang('en');
              }}
            >
              Ingles
            </button>
            <button
              className={`btn-ghost ${activeLang === 'pt' ? 'text-primary' : ''}`}
              type="button"
              onClick={() => {
                setGoogleTranslateLanguage('pt');
                setActiveLang('pt');
              }}
            >
              Portugues
            </button>
            <button
              className={`btn-ghost ${activeLang === 'fr' ? 'text-primary' : ''}`}
              type="button"
              onClick={() => {
                setGoogleTranslateLanguage('fr');
                setActiveLang('fr');
              }}
            >
              Frances
            </button>
            <button
              className={`btn-ghost ${activeLang === 'it' ? 'text-primary' : ''}`}
              type="button"
              onClick={() => {
                setGoogleTranslateLanguage('it');
                setActiveLang('it');
              }}
            >
              Italiano
            </button>
            <button
              className={`btn-ghost ${activeLang === 'de' ? 'text-primary' : ''}`}
              type="button"
              onClick={() => {
                setGoogleTranslateLanguage('de');
                setActiveLang('de');
              }}
            >
              Aleman
            </button>
            <button
              className={`btn-ghost ${activeLang === 'zh-CN' ? 'text-primary' : ''}`}
              type="button"
              onClick={() => {
                setGoogleTranslateLanguage('zh-CN');
                setActiveLang('zh-CN');
              }}
            >
              Chino
            </button>
          </div>
      </nav>
        <div className="fixed bottom-16 right-4 z-40 flex flex-wrap gap-2 lg:hidden">
          <button
            className={`btn-ghost ${activeLang === 'es' ? 'text-primary' : ''}`}
            type="button"
            onClick={() => {
              setGoogleTranslateLanguage('es');
              setActiveLang('es');
            }}
          >
            Espanol
          </button>
          <button
            className={`btn-ghost ${activeLang === 'en' ? 'text-primary' : ''}`}
            type="button"
            onClick={() => {
              setGoogleTranslateLanguage('en');
              setActiveLang('en');
            }}
          >
            Ingles
          </button>
          <button
            className={`btn-ghost ${activeLang === 'pt' ? 'text-primary' : ''}`}
            type="button"
            onClick={() => {
              setGoogleTranslateLanguage('pt');
              setActiveLang('pt');
            }}
          >
            Portugues
          </button>
          <button
            className={`btn-ghost ${activeLang === 'fr' ? 'text-primary' : ''}`}
            type="button"
            onClick={() => {
              setGoogleTranslateLanguage('fr');
              setActiveLang('fr');
            }}
          >
            Frances
          </button>
          <button
            className={`btn-ghost ${activeLang === 'it' ? 'text-primary' : ''}`}
            type="button"
            onClick={() => {
              setGoogleTranslateLanguage('it');
              setActiveLang('it');
            }}
          >
            Italiano
          </button>
          <button
            className={`btn-ghost ${activeLang === 'de' ? 'text-primary' : ''}`}
            type="button"
            onClick={() => {
              setGoogleTranslateLanguage('de');
              setActiveLang('de');
            }}
          >
            Aleman
          </button>
          <button
            className={`btn-ghost ${activeLang === 'zh-CN' ? 'text-primary' : ''}`}
            type="button"
            onClick={() => {
              setGoogleTranslateLanguage('zh-CN');
              setActiveLang('zh-CN');
            }}
          >
            Chino
          </button>
        </div>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0a1020]/90 px-4 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {mobileLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-1 text-[11px] ${location.pathname === link.to ? 'text-primary' : 'text-muted'}`}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d={iconMap[link.to] || 'M5 12h14'} />
              </svg>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
