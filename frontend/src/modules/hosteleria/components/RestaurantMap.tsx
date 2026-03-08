import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '../../../shared/animations/gsapConfig';

export type TableStatus = 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'LIMPIEZA';

export type RestaurantTable = {
  id: string;
  label: string;
  status: TableStatus;
  capacity?: number;
};

type RestaurantMapProps = {
  tables: RestaurantTable[];
  onTableClick?: (table: RestaurantTable) => void;
};

const statusLabels: Record<TableStatus, string> = {
  LIBRE: 'Libre',
  OCUPADA: 'Ocupada',
  RESERVADA: 'Reservada',
  LIMPIEZA: 'Limpieza'
};

export function RestaurantMap({ tables, onTableClick }: RestaurantMapProps) {
  const tableRefs = useRef(new Map<string, HTMLButtonElement>());
  const prevStatus = useRef(new Map<string, TableStatus>());
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) || null,
    [tables, selectedTableId]
  );

  useEffect(() => {
    const tweens: gsap.core.Tween[] = [];
    tables.forEach((table) => {
      const previous = prevStatus.current.get(table.id);
      const element = tableRefs.current.get(table.id);
      if (!element) return;

      if (previous === 'LIBRE' && table.status === 'OCUPADA') {
        const glowColor = getComputedStyle(element).getPropertyValue('--table-occupied').trim() || 'var(--secondary)';
        tweens.push(
          gsap.fromTo(
            element,
            { boxShadow: `0 0 0 rgba(0, 0, 0, 0)` },
            {
              boxShadow: `0 0 24px ${glowColor}`,
              duration: 0.45,
              ease: 'power2.out',
              yoyo: true,
              repeat: 1
            }
          )
        );
      }

      prevStatus.current.set(table.id, table.status);
    });

    return () => {
      tweens.forEach((tween) => tween.kill());
    };
  }, [tables]);

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Mapa de mesas</h2>
        <p className="section-subtitle">Control visual de estados en tiempo real.</p>
      </header>

      <div
        className="app-card grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{
          ['--table-free' as string]: 'var(--primary)',
          ['--table-occupied' as string]: 'var(--secondary)',
          ['--table-reserved' as string]: 'var(--primary-glow)',
          ['--table-cleaning' as string]: 'var(--primary)'
        }}
      >
        {tables.map((table) => {
          const statusColor =
            table.status === 'LIBRE'
              ? 'var(--table-free)'
              : table.status === 'OCUPADA'
              ? 'var(--table-occupied)'
              : table.status === 'RESERVADA'
              ? 'var(--table-reserved)'
              : 'var(--table-cleaning)';
          const isSelected = table.id === selectedTableId;

          return (
            <button
              key={table.id}
              type="button"
              ref={(node) => {
                if (node) {
                  tableRefs.current.set(table.id, node);
                } else {
                  tableRefs.current.delete(table.id);
                }
              }}
              onClick={() => {
                setSelectedTableId(table.id);
                onTableClick?.(table);
              }}
              className="flex flex-col items-start gap-3 rounded-2xl border-4 p-4 text-left transition-transform duration-200 hover:-translate-y-1"
              style={{
                borderColor: statusColor,
                boxShadow: isSelected ? `0 0 0 4px var(--primary-glow)` : 'none'
              }}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-lg font-semibold">{table.label}</span>
                <span
                  className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                  style={{ borderColor: statusColor, color: statusColor }}
                >
                  {statusLabels[table.status]}
                </span>
              </div>
              <p className="text-xs text-muted">Capacidad: {table.capacity ?? 'N/A'}</p>
            </button>
          );
        })}
      </div>

      {selectedTable && selectedTable.status === 'OCUPADA' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="app-card w-full max-w-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Comanda</h3>
                <p className="text-xs text-muted">Mesa {selectedTable.label}</p>
              </div>
              <button
                className="btn-ghost"
                type="button"
                onClick={() => setSelectedTableId(null)}
              >
                Cerrar
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-[rgba(255,255,255,0.08)] p-4 text-sm text-muted">
              Placeholder de comanda. Aqui se mostraran items y estados.
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
