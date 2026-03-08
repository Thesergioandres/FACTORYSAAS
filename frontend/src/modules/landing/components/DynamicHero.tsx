import { useEffect, useState } from 'react';
import { apiRequest } from '../../../shared/infrastructure/http/apiClient';
import { EssenceMicroSymbol } from '../../../shared/components/EssenceMicroSymbol';

type ContentPayload = {
  title: string;
  subtitle: string;
  benefits: string[];
};

export function DynamicHero({ verticalId, verticalName }: { verticalId: string; verticalName: string }) {
  const [content, setContent] = useState<ContentPayload | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<ContentPayload>(`/content/landing/${verticalId}`)
      .then((data) => {
        if (active) setContent(data);
      })
      .catch(() => {
        if (active) {
          setContent({
            title: `Plataforma white-label para ${verticalName}`,
            subtitle: 'Configura operaciones, permisos y ventas con identidad propia.',
            benefits: ['Marca propia lista', 'Rutas y permisos por rol', 'Monitoreo en tiempo real']
          });
        }
      });
    return () => {
      active = false;
    };
  }, [verticalId, verticalName]);

  if (!content) {
    return (
      <div className="app-card">
        <p className="text-sm text-muted">Cargando identidad de la vertical...</p>
      </div>
    );
  }

  return (
    <div className="app-card relative overflow-hidden p-10">
      <div
        className="absolute -right-20 -top-20 h-56 w-56 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(circle at 40% 40%, var(--primary-glow), transparent 65%)' }}
      />
      <p className="app-chip">ADN de la vertical</p>
      <h1 className="mt-6 text-4xl font-semibold md:text-5xl brand-gradient-text">{content.title}</h1>
      <p className="mt-4 text-sm text-muted">{content.subtitle}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {content.benefits.map((benefit) => (
          <div key={benefit} className="flex items-start gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] p-4">
            <EssenceMicroSymbol size={20} />
            <p className="text-sm text-ink">{benefit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
