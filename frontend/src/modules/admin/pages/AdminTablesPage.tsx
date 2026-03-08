import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/infrastructure/http/apiClient';
import { RestaurantMap, type RestaurantTable, type TableStatus } from '../../hosteleria/components/RestaurantMap';

type TableRecord = {
  id: string;
  name: string;
  capacity?: number;
  status: TableStatus;
};

const statusOptions: TableStatus[] = ['LIBRE', 'OCUPADA', 'RESERVADA', 'LIMPIEZA'];

export function AdminTablesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selected, setSelected] = useState<TableRecord | null>(null);

  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: () => apiRequest<TableRecord[]>('/tables')
  });

  const createTable = useMutation({
    mutationFn: (payload: { name: string; capacity?: number }) =>
      apiRequest<TableRecord>('/tables', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setName('');
      setCapacity('');
    }
  });

  const updateStatus = useMutation({
    mutationFn: (payload: { id: string; status: TableStatus }) =>
      apiRequest<TableRecord>(`/tables/${payload.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: payload.status })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tables'] })
  });

  const tables = useMemo<RestaurantTable[]>(() => {
    return (tablesQuery.data || []).map((table) => ({
      id: table.id,
      label: table.name,
      status: table.status,
      capacity: table.capacity
    }));
  }, [tablesQuery.data]);

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Mesas y mapa interactivo</h2>
        <p className="section-subtitle">Controla ocupacion y cambia estados en segundos.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {tablesQuery.isLoading ? (
            <div className="app-card">
              <p className="text-sm text-muted">Cargando mesas...</p>
            </div>
          ) : tablesQuery.isError ? (
            <div className="app-card">
              <p className="text-sm text-secondary">No se pudieron cargar las mesas.</p>
            </div>
          ) : (
            <RestaurantMap
              tables={tables}
              onTableClick={(table) => {
                const match = tablesQuery.data?.find((item) => item.id === table.id) || null;
                setSelected(match);
              }}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="app-card">
            <h3 className="text-lg font-semibold">Nueva mesa</h3>
            <div className="mt-4 grid gap-3">
              <input
                className="app-input"
                placeholder="Nombre o numero"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <input
                className="app-input"
                placeholder="Capacidad"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                inputMode="numeric"
              />
              <button
                className="btn-primary"
                type="button"
                disabled={!name.trim() || createTable.isPending}
                onClick={() => {
                  const numericCapacity = Number(capacity);
                  createTable.mutate({
                    name: name.trim(),
                    capacity: Number.isNaN(numericCapacity) ? undefined : numericCapacity
                  });
                }}
              >
                Guardar mesa
              </button>
            </div>
          </div>

          <div className="app-card">
            <h3 className="text-lg font-semibold">Estado rapido</h3>
            {selected ? (
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm text-muted">Mesa</p>
                  <p className="text-lg font-semibold">{selected.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      className={status === selected.status ? 'btn-primary' : 'btn-secondary'}
                      type="button"
                      onClick={() => updateStatus.mutate({ id: selected.id, status })}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">Selecciona una mesa en el mapa para actualizar su estado.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
