import type { ReactNode } from 'react';

export function ModuleUpsellCard({
  title,
  description,
  action
}: {
  title: string;
  description: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="app-card">
      <p className="app-chip">Desbloquea esta funcion</p>
      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <div className="mt-4">{action || <button className="btn-primary" type="button">Mejorar plan</button>}</div>
    </div>
  );
}
