import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { BrandMark } from '../components/BrandMark';
import { useTenant } from '../context/TenantContext';
import { TopLoadingBar } from '../components/TopLoadingBar';
import { gsap } from '../animations/gsapConfig';

export function BookingLayout() {
  const { tenant } = useTenant();
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [location.pathname]);

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

      <main className="app-container py-10" ref={contentRef}>
        <Outlet />
      </main>
    </div>
  );
}
