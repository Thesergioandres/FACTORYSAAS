import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
            <button
              className="app-nav-surface flex items-center gap-2 px-3 py-2 text-xs lg:hidden"
              type="button"
              onClick={() => setIsMenuOpen(true)}
            >
              <span>Menu</span>
            </button>
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
        <nav className="app-nav-surface mt-6 hidden flex-wrap gap-2 lg:flex">
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

      {isMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setIsMenuOpen(false)}>
          <aside
            className="app-nav-surface absolute left-4 top-4 w-72 max-w-[80vw] p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Navegacion</p>
              <button className="btn-ghost" type="button" onClick={() => setIsMenuOpen(false)}>
                Cerrar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {user?.role === 'ADMIN' || user?.role === 'OWNER' || user?.role === 'GOD' ? (
                <NavLink className={navLinkClass} to="/admin" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </NavLink>
              ) : null}
              {(user?.role === 'ADMIN' || user?.role === 'OWNER' || user?.role === 'GOD')
                ? adminModules.map((module) => (
                    <NavLink
                      key={module.key}
                      className={navLinkClass}
                      to={module.adminPath as string}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {module.label}
                    </NavLink>
                  ))
                : null}
              {user?.role === 'STAFF'
                ? staffModules.map((module) => (
                    <NavLink
                      key={module.key}
                      className={navLinkClass}
                      to={module.adminPath as string}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {module.label}
                    </NavLink>
                  ))
                : null}
              {user?.role === 'GOD' ? (
                <NavLink className={navLinkClass} to="/god" onClick={() => setIsMenuOpen(false)}>
                  God Panel
                </NavLink>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}

      <main className="app-container py-10 pb-24 lg:pb-10">
        <Outlet />
      </main>
    </div>
  );
}
