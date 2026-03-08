import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { BrandMark } from '../components/BrandMark';
import { TopLoadingBar } from '../components/TopLoadingBar';
import { gsap } from '../animations/gsapConfig';

export function LandingLayout() {
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
    <div className="app-shell" style={{ ['--logo-url' as string]: 'url("/essence-logo.png")' }}>
      <TopLoadingBar />
      <header className="app-header border-b backdrop-blur">
        <div className="app-container flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-3xl bg-black/30 p-2 shadow-[0_0_26px_rgba(0,240,255,0.25)]">
              <BrandMark size={125} />
            </div>
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
      <main className="app-container py-10" ref={contentRef}>
        <Outlet />
      </main>
    </div>
  );
}
