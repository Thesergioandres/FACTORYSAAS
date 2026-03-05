import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useTenant } from '../../../../shared/context/TenantContext';
import { moduleRegistry } from '../../../../shared/constants/moduleRegistry';

const baseLinks = [
  { to: '/admin', label: 'Resumen' },
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
  const activeModules = tenant?.activeModules || [];
  const staffAllowedModules = new Set(['agenda', 'inventory', 'pos', 'tables']);

  const staffLinks = Object.values(moduleRegistry)
    .filter((module) => module.adminPath && staffAllowedModules.has(module.key) && activeModules.includes(module.key))
    .map((module) => ({ to: module.adminPath as string, label: module.label }));

  const adminLinks = user?.role === 'GOD'
    ? [...baseLinks, { to: '/admin/tenants', label: 'Negocios' }, { to: '/admin/approvals', label: 'Aprobaciones' }]
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

  return (
    <nav className="app-nav-surface flex flex-wrap gap-2 text-xs">
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
    </nav>
  );
}
