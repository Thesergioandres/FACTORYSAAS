import { Skeleton } from '../../../shared/components/Skeleton';
import { useAgenda } from '../hooks/useAgenda';
import { useLabels } from '../../../shared/hooks/useLabels';

export function AdminAgendaPage() {
  const { data, isLoading, isError } = useAgenda();
  const labels = useLabels();

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Agenda con refresh vivo</h2>
        <p className="section-subtitle">Actualiza cada 30 segundos o via WebSocket.</p>
      </header>

      {isLoading ? (
        <div className="grid gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : isError ? (
        <div className="app-card">
          <p className="text-sm text-muted">No se pudo cargar la agenda.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {data?.map((item) => (
            <div key={item.id} className="app-card flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted">{item.startTime}</p>
                <p className="text-lg font-semibold">{item.clientName}</p>
                <p className="text-sm text-muted">{item.serviceName} · {labels.staff}: {item.staffName}</p>
              </div>
              <span className="status-pill">{item.status}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
