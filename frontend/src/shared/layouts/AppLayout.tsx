import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { BrandMark } from '../components/BrandMark';
import { moduleRegistry } from '../constants/moduleRegistry';
import { TopLoadingBar } from '../components/TopLoadingBar';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `app-navlink ${isActive ? 'app-navlink--active' : ''}`;

export function AppLayout() {
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const activeModules = tenant?.activeModules || [];
  const isGod = user?.role === 'GOD';
  const isOwner = user?.role === 'OWNER';
  const staffAllowedModules = new Set(['agenda', 'inventory', 'pos', 'tables']);

  const adminModules = Object.values(moduleRegistry).filter(
    (module) => module.adminPath && (isGod || isOwner || activeModules.includes(module.key))
  );
  const staffModules = Object.values(moduleRegistry).filter(
    (module) => module.adminPath && staffAllowedModules.has(module.key) && activeModules.includes(module.key)
  );

  return (
    <div className="app-shell">
      <TopLoadingBar />
      <header className="app-header border-b backdrop-blur">
        <div className="app-container flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="app-chip">{tenant?.name || 'ESSENCE FACTORY SAAS'}</p>
              <h1 className="text-3xl font-semibold">Tu plataforma white-label</h1>
              <p className="mt-2 text-sm text-muted">Unifica reservas, operaciones y crecimiento por tenant.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <div className="text-right text-xs text-muted">
                <p className="font-semibold text-ink">{user.name || 'Usuario'}</p>
                <p className="uppercase tracking-[0.18em]">{user.role}</p>
              </div>
            ) : null}
            {user ? (
              <button className="btn-ghost" type="button" onClick={logout}>
                Cerrar sesion
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="app-container">
        <nav className="app-nav-surface mt-6 flex flex-wrap gap-2">
          {user?.role === 'ADMIN' || user?.role === 'OWNER' || user?.role === 'GOD' ? (
            <NavLink className={navLinkClass} to="/admin">
              Dashboard
            </NavLink>
          ) : null}
          {(user?.role === 'ADMIN' || user?.role === 'OWNER' || user?.role === 'GOD')
            ? adminModules.map((module) => (
                <NavLink key={module.key} className={navLinkClass} to={module.adminPath as string}>
                  {module.label}
                </NavLink>
              ))
            : null}
          {user?.role === 'STAFF'
            ? staffModules.map((module) => (
                <NavLink key={module.key} className={navLinkClass} to={module.adminPath as string}>
                  {module.label}
                </NavLink>
              ))
            : null}
          {user?.role === 'GOD' ? (
            <NavLink className={navLinkClass} to="/god">
              God Panel
            </NavLink>
          ) : null}
        </nav>
      </div>

      <main className="app-container py-10">
        <Outlet />
      </main>
    </div>
  );
}
