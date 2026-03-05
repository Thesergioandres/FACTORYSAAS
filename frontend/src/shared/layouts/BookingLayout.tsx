import { Outlet } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
import { useTenant } from '../context/TenantContext';
import { TopLoadingBar } from '../components/TopLoadingBar';

export function BookingLayout() {
  const { tenant } = useTenant();

  return (
    <div className="app-shell">
      <TopLoadingBar />
      <header className="app-header border-b backdrop-blur">
        <div className="app-container flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="app-chip">{tenant?.name || 'Booking Engine'}</p>
              <h1 className="text-3xl font-semibold">Reserva en minutos</h1>
              <p className="mt-2 text-sm text-muted">Selecciona ubicacion, servicio, especialista y fecha.</p>
            </div>
          </div>
          <button className="btn-secondary" type="button">
            ¿Necesitas ayuda?
          </button>
        </div>
      </header>

      <main className="app-container py-10">
        <Outlet />
      </main>
    </div>
  );
}
