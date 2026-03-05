import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTenant } from '../../../../shared/context/TenantContext';

const ADMIN_WHATSAPP = '+573000000000';

export function LicenseExpiredPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const companyName = tenant?.name || 'mi empresa';
  const vertical = tenant?.verticalSlug || 'servicio';

  const message = useMemo(() => {
    return `Hola, quiero renovar mi licencia de ${companyName} para el servicio de ${vertical}`;
  }, [companyName, vertical]);

  const whatsappLink = `https://wa.me/${ADMIN_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  const handleVerify = () => queryClient.invalidateQueries({ queryKey: ['tenant'] });

  return (
    <section
      className="space-y-6 rounded-2xl p-6"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-app)' }}
    >
      <header className="app-card">
        <h2 className="section-title">Tu acceso ha sido suspendido</h2>
        <p className="section-subtitle">Renueva tu licencia para reactivar todas las funciones.</p>
      </header>

      <div className="app-card space-y-4">
        <p className="text-sm text-muted">
          Tu cuenta se encuentra suspendida por vencimiento de licencia. Nuestro equipo puede ayudarte a reactivar el acceso de inmediato.
        </p>
        <a className="btn-primary w-fit" href={whatsappLink} target="_blank" rel="noreferrer">
          Renovar Licencia via WhatsApp
        </a>
        <button className="btn-secondary w-fit" type="button" onClick={handleVerify}>
          Ya realice mi pago / Verificar ahora
        </button>
      </div>

      <div className="app-card">
        <h3 className="text-lg font-semibold">Metodos de pago disponibles</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>Transferencia bancaria</li>
          <li>Nequi / Daviplata</li>
          <li>Pago con tarjeta (link de cobro)</li>
        </ul>
      </div>
    </section>
  );
}
