import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useTenant } from '../../../../shared/context/TenantContext';
import { moduleRegistry } from '../../../../shared/constants/moduleRegistry';

const baseLinks = [
  { to: '/admin', labelKey: 'nav.summary' },
  { to: '/admin/users', labelKey: 'nav.users' },
  { to: '/admin/services', labelKey: 'nav.services' },
  { to: '/admin/appointments', labelKey: 'nav.appointments' },
  { to: '/admin/agenda', labelKey: 'nav.agenda' },
  { to: '/admin/notifications', labelKey: 'nav.whatsapp' },
  { to: '/admin/reports', labelKey: 'nav.reports' }
];

export function AdminNav() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const activeModules = tenant?.activeModules || [];
  const staffAllowedModules = new Set(['agenda', 'inventory', 'pos', 'tables']);

  const staffLinks = Object.values(moduleRegistry)
    .filter((module) => module.adminPath && staffAllowedModules.has(module.key) && activeModules.includes(module.key))
    .map((module) => ({ to: module.adminPath as string, label: module.label }));

  const adminLinks = user?.role === 'GOD'
    ? [...baseLinks, { to: '/admin/tenants', labelKey: 'nav.businesses' }, { to: '/admin/approvals', labelKey: 'nav.approvals' }]
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
      '/admin/approvals': 'M5 13l4 4L19 7'
    };

  const mobileLinks = links.slice(0, 4);

  return (
    <>
      <nav className="app-nav-surface hidden flex-wrap gap-2 text-xs lg:flex">
          {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`app-navlink ${location.pathname === link.to ? 'app-navlink--active' : ''}`}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d={iconMap[link.to] || 'M5 12h14'} />
            </svg>
              {'label' in link ? link.label : t(link.labelKey)}
          </Link>
        ))}
          <div className="ml-auto flex items-center gap-2">
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
      </nav>
        <div className="fixed bottom-16 right-4 z-40 flex gap-2 lg:hidden">
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
              {'label' in link ? link.label : t(link.labelKey)}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
