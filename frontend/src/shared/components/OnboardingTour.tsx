import { useEffect, useState } from 'react';

type TourStep = {
  title: string;
  description: string;
};

type OnboardingTourProps = {
  steps: TourStep[];
  isOpen: boolean;
  onFinish: () => void;
};

export function OnboardingTour({ steps, isOpen, onFinish }: OnboardingTourProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIndex(0);
    }
  }, [isOpen]);

  if (!isOpen || steps.length === 0) return null;

  const step = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="app-card w-full max-w-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Paso {index + 1} de {steps.length}</p>
        <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
        <p className="mt-3 text-sm text-muted">{step.description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <button
            className="btn-ghost"
            type="button"
            onClick={onFinish}
          >
            Omitir
          </button>
          <div className="flex items-center gap-2">
            {index > 0 ? (
              <button
                className="btn-secondary"
                type="button"
                onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
              >
                Anterior
              </button>
            ) : null}
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
                if (isLast) {
                  onFinish();
                } else {
                  setIndex((prev) => Math.min(prev + 1, steps.length - 1));
                }
              }}
            >
              {isLast ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
