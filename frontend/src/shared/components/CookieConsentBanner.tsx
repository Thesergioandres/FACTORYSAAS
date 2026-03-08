import { useEffect, useState } from 'react';

const STORAGE_KEY = 'essence_cookie_consent';

type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

function readConsent(): CookieConsent | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

function writeConsent(consent: CookieConsent) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent('cookie-consent', { detail: consent }));
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setVisible(true);
      return;
    }
    setAnalytics(existing.analytics);
    setMarketing(existing.marketing);
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    writeConsent({ necessary: true, analytics: true, marketing: true, updatedAt: new Date().toISOString() });
    setVisible(false);
  };

  const acceptNecessary = () => {
    writeConsent({ necessary: true, analytics: false, marketing: false, updatedAt: new Date().toISOString() });
    setVisible(false);
  };

  const savePreferences = () => {
    writeConsent({ necessary: true, analytics, marketing, updatedAt: new Date().toISOString() });
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-4 bottom-6 z-50">
      <div className="app-card space-y-4 border border-[rgba(0,240,255,0.2)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Preferencias de cookies</p>
            <p className="mt-1 text-xs text-muted">
              Usamos cookies necesarias para sesiones y seguridad. Las analiticas y de marketing son opcionales.
            </p>
          </div>
          <a className="btn-ghost text-xs" href="/legal/cookies">
            Ver politica
          </a>
        </div>

        <div className="grid gap-3 text-xs text-muted md:grid-cols-3">
          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] p-3">
            <p className="text-ink">Necesarias</p>
            <p className="mt-1">Sesiones de login, idioma, seguridad.</p>
            <span className="mt-2 inline-flex rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em]">
              Siempre activas
            </span>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] p-3">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
              <span>
                <span className="text-ink">Analiticas</span>
                <span className="mt-1 block">Google Analytics y medicion de producto.</span>
              </span>
            </label>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] p-3">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(event) => setMarketing(event.target.checked)}
              />
              <span>
                <span className="text-ink">Marketing</span>
                <span className="mt-1 block">Pixels de conversion y campanas.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary" type="button" onClick={acceptNecessary}>
            Solo necesarias
          </button>
          <button className="btn-secondary" type="button" onClick={savePreferences}>
            Guardar preferencias
          </button>
          <button className="btn-primary" type="button" onClick={acceptAll}>
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
