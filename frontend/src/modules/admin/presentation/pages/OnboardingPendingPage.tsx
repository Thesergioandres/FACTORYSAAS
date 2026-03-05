import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTenant } from '../../../../shared/context/TenantContext';

const ADMIN_WHATSAPP = '+573000000000';

export function OnboardingPendingPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const companyName = tenant?.name || 'tu empresa';
  const vertical = tenant?.verticalSlug || 'servicio';

  const message = useMemo(() => {
    return `Hola, queremos conocer el estado de activacion de ${companyName} para ${vertical}`;
  }, [companyName, vertical]);

  const whatsappLink = `https://wa.me/${ADMIN_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  const handleVerify = () => queryClient.invalidateQueries({ queryKey: ['tenant'] });

  return (
    <section
      className="space-y-6 rounded-2xl p-6"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-app)' }}
    >
      <header className="app-card">
        <h2 className="section-title">Estamos configurando tu entorno</h2>
        <p className="section-subtitle">Te avisaremos por WhatsApp cuando todo este listo.</p>
      </header>

      <div className="app-card space-y-4">
        <p className="text-sm text-muted">
          Tu cuenta esta en revision y configuracion. Si necesitas una activacion mas rapida, contactanos directamente.
        </p>
        <a className="btn-secondary w-fit" href={whatsappLink} target="_blank" rel="noreferrer">
          Consultar estado por WhatsApp
        </a>
        <button className="btn-secondary w-fit" type="button" onClick={handleVerify}>
          Ya realice mi pago / Verificar ahora
        </button>
      </div>
    </section>
  );
}
