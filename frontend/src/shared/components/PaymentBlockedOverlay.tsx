import { useEffect, useRef, useState } from 'react';
import { gsap } from '../animations/gsapConfig';
import { PAYMENT_REQUIRED_EVENT } from '../infrastructure/http/apiClient';

/**
 * PaymentBlockedOverlay — "Muro de Pagos B2B"
 *
 * Overlay FULL-SCREEN que se activa cuando el backend devuelve 402 Payment Required.
 * NO se puede cerrar. El usuario debe regularizar su suscripción para continuar.
 *
 * Usa GSAP para la entrada dramática y un loop de pulso en el borde del card.
 */
export function PaymentBlockedOverlay() {
  const [blocked, setBlocked] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setBlocked(true);
    window.addEventListener(PAYMENT_REQUIRED_EVENT, handler);
    return () => window.removeEventListener(PAYMENT_REQUIRED_EVENT, handler);
  }, []);

  // Animación de entrada con GSAP
  useEffect(() => {
    if (!blocked || !overlayRef.current || !cardRef.current || !glowRef.current) return;

    const tl = gsap.timeline();

    // Backdrop fade in
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );

    // Card slide up + scale
    tl.fromTo(
      cardRef.current,
      { y: 60, scale: 0.92, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.4)' },
      '-=0.15'
    );

    // Glow pulse loop
    gsap.to(glowRef.current, {
      boxShadow: '0 0 60px rgba(138, 43, 226, 0.6), 0 0 120px rgba(0, 240, 255, 0.2)',
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    return () => {
      tl.kill();
    };
  }, [blocked]);

  if (!blocked) return null;

  return (
    <div
      ref={overlayRef}
      id="payment-blocked-overlay"
      className="fixed inset-0 z-9999 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(5, 7, 14, 0.92)',
        backdropFilter: 'blur(12px)'
      }}
    >
      <div
        ref={cardRef}
        className="relative mx-4 max-w-lg w-full rounded-2xl border p-8 sm:p-10 text-center"
        style={{
          borderColor: 'rgba(138, 43, 226, 0.4)',
          backgroundColor: 'rgba(10, 15, 30, 0.85)',
          backdropFilter: 'blur(25px)'
        }}
      >
        {/* Glow ring */}
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: '0 0 40px rgba(138, 43, 226, 0.3), 0 0 80px rgba(0, 240, 255, 0.1)'
          }}
        />

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(0, 240, 255, 0.1))',
            border: '1px solid rgba(138, 43, 226, 0.4)'
          }}
        >
          <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--secondary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>

        {/* Title */}
        <h2
          className="text-2xl font-bold mb-3"
          style={{
            fontFamily: '"Playfair Display", serif',
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Suscripción Suspendida
        </h2>

        {/* Body */}
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Tu cuenta ha sido suspendida por falta de pago.
          Para continuar utilizando <span className="font-semibold" style={{ color: 'var(--primary)' }}>ESSENCE Factory</span>,
          regulariza tu suscripción.
        </p>

        {/* CTA */}
        <a
          href="/license-expired"
          className="btn-primary inline-flex items-center gap-2 justify-center w-full"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          Regularizar Suscripción
        </a>

        {/* Fine print */}
        <p className="mt-4 text-xs" style={{ color: 'var(--muted)', opacity: 0.6 }}>
          Código HTTP 402 — Payment Required
        </p>
      </div>
    </div>
  );
}
