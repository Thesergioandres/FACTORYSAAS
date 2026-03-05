import { useMemo, useState } from 'react';
import { useTenant } from '../../shared/context/TenantContext';

const steps = ['Sede', 'Servicio', 'Staff', 'Fecha'];

const options = {
  Sede: ['Centro', 'Norte', 'Sur'],
  Servicio: ['Fade premium', 'Barba express', 'Color'],
  Staff: ['Rafa', 'Leo', 'Mara'],
  Fecha: ['Hoy 17:30', 'Manana 10:00', 'Sabado 12:30']
};

export function BookingEnginePage() {
  const { tenant } = useTenant();
  const [stepIndex, setStepIndex] = useState(0);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const currentStep = steps[stepIndex];

  const summary = useMemo(() => steps.map((step) => ({ step, value: selection[step] })), [selection]);

  const advance = (value: string) => {
    setSelection((prev) => ({ ...prev, [currentStep]: value }));
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="app-card">
        <p className="app-chip">{tenant?.name || 'Reserva express'}</p>
        <h2 className="mt-4 text-3xl font-semibold">Paso {stepIndex + 1}: {currentStep}</h2>
        <p className="mt-2 text-sm text-muted">Completa el flujo en 60 segundos.</p>

        <div className="mt-6 grid gap-3">
          {options[currentStep as keyof typeof options].map((item) => (
            <button
              key={item}
              className="app-card-soft text-left text-sm font-semibold"
              type="button"
              onClick={() => advance(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button className="btn-secondary" type="button" onClick={goBack} disabled={stepIndex === 0}>
            Volver
          </button>
          <button className="btn-primary" type="button" disabled={!selection[currentStep]}>
            Confirmar
          </button>
        </div>
      </div>

      <div className="app-card">
        <h3 className="text-lg font-semibold">Resumen</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {summary.map((item) => (
            <li key={item.step} className="flex items-center justify-between">
              <span>{item.step}</span>
              <span className="text-ink">{item.value || 'Pendiente'}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 app-card-soft">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Tiempo estimado</p>
          <p className="mt-2 text-2xl font-semibold">15 min</p>
        </div>
      </div>
    </section>
  );
}
