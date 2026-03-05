import { Outlet } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
import { TopLoadingBar } from '../components/TopLoadingBar';

export function LandingLayout() {
  return (
    <div className="app-shell">
      <TopLoadingBar />
      <header className="app-header border-b backdrop-blur">
        <div className="app-container flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="app-chip">ESSENCE FACTORY SAAS</p>
              <h1 className="text-3xl font-semibold">Lanza tu white-label en dias</h1>
              <p className="mt-2 text-sm text-muted">Marca, permisos y rutas por tenant en tiempo real.</p>
            </div>
          </div>
          <a className="btn-primary" href="/admin-login">
            Login para administradores
          </a>
        </div>
      </header>
      <main className="app-container py-10">
        <Outlet />
      </main>
    </div>
  );
}
