import { useState } from 'react';
import { useTables } from '../../hosteleria/hooks/useTables';
import { RestaurantMap, type RestaurantTable, type TableStatus } from '../../hosteleria/components/RestaurantMap';

const statusOptions: TableStatus[] = ['LIBRE', 'OCUPADA', 'RESERVADA', 'LIMPIEZA'];

export function AdminTablesPage() {
  const { tables, isLoading, isError, createTable, updateStatus } = useTables();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selected, setSelected] = useState<{ id: string; name: string; status: TableStatus } | null>(null);

  const mappedTables: RestaurantTable[] = tables.map((table) => ({
    id: table.id,
    label: table.name,
    status: table.status,
    capacity: table.capacity,
    currentOrderId: table.currentOrderId
  }));

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Mesas y mapa interactivo</h2>
        <p className="section-subtitle">Controla ocupacion y cambia estados en segundos.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {isLoading ? (
            <div className="app-card">
              <p className="text-sm text-muted">Cargando mesas...</p>
            </div>
          ) : isError ? (
            <div className="app-card">
              <p className="text-sm text-secondary">No se pudieron cargar las mesas.</p>
            </div>
          ) : (
            <RestaurantMap
              tables={mappedTables}
              onTableClick={(table) => {
                const match = tables.find((item) => item.id === table.id);
                if (match) {
                  setSelected({ id: match.id, name: match.name, status: match.status });
                }
              }}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="app-card">
            <h3 className="text-lg font-semibold">Nueva mesa</h3>
            <div className="mt-4 grid gap-3">
              <input
                className="input-field"
                placeholder="Nombre o numero"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <input
                className="input-field"
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
                  setName('');
                  setCapacity('');
                }}
              >
                {createTable.isPending ? 'Guardando...' : 'Guardar mesa'}
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
                      disabled={updateStatus.isPending}
                      onClick={() => {
                        updateStatus.mutate(
                          { id: selected.id, status },
                          {
                            onSuccess: () => {
                              setSelected((prev) => (prev ? { ...prev, status } : null));
                            }
                          }
                        );
                      }}
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
