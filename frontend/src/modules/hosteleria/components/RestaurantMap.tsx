import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '../../../shared/animations/gsapConfig';

export type TableStatus = 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'LIMPIEZA';

export type RestaurantTable = {
  id: string;
  label: string;
  status: TableStatus;
  capacity?: number;
  currentOrderId?: string;
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

const STATUS_COLORS: Record<TableStatus, { border: string; glow: string; bg: string }> = {
  LIBRE: {
    border: 'rgba(0, 240, 255, 0.35)',
    glow: 'rgba(0, 240, 255, 0.15)',
    bg: 'rgba(0, 240, 255, 0.04)'
  },
  OCUPADA: {
    border: 'rgba(138, 43, 226, 0.7)',
    glow: 'rgba(138, 43, 226, 0.4)',
    bg: 'rgba(138, 43, 226, 0.08)'
  },
  RESERVADA: {
    border: 'rgba(255, 183, 77, 0.6)',
    glow: 'rgba(255, 183, 77, 0.25)',
    bg: 'rgba(255, 183, 77, 0.06)'
  },
  LIMPIEZA: {
    border: 'rgba(100, 180, 255, 0.4)',
    glow: 'rgba(100, 180, 255, 0.15)',
    bg: 'rgba(100, 180, 255, 0.04)'
  }
};

export function RestaurantMap({ tables, onTableClick }: RestaurantMapProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const tableRefs = useRef(new Map<string, HTMLButtonElement>());
  const prevStatus = useRef(new Map<string, TableStatus>());
  const pulseTimelines = useRef(new Map<string, gsap.core.Tween>());
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) || null,
    [tables, selectedTableId]
  );

  // ── Entrance stagger animation ──────────────────────
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll('[data-table-card]')) as HTMLElement[];
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 20, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out'
      }
    );
  }, [tables.length]);

  // ── Status change animations & persistent pulse ─────
  useEffect(() => {
    const newTweens: gsap.core.Tween[] = [];

    tables.forEach((table) => {
      const previous = prevStatus.current.get(table.id);
      const element = tableRefs.current.get(table.id);
      if (!element) return;

      const colors = STATUS_COLORS[table.status];

      // Kill existing pulse for this table if status changed
      if (previous && previous !== table.status) {
        const existingPulse = pulseTimelines.current.get(table.id);
        if (existingPulse) {
          existingPulse.kill();
          pulseTimelines.current.delete(table.id);
        }

        // Flash transition animation
        newTweens.push(
          gsap.fromTo(
            element,
            { scale: 1.06, boxShadow: `0 0 30px ${colors.glow}` },
            {
              scale: 1,
              boxShadow: `0 0 0px transparent`,
              duration: 0.5,
              ease: 'back.out(1.7)'
            }
          )
        );
      }

      // Persistent pulse for OCUPADA tables
      if (table.status === 'OCUPADA' && !pulseTimelines.current.has(table.id)) {
        const pulse = gsap.to(element, {
          boxShadow: `0 0 20px ${colors.glow}, inset 0 0 0 1px ${colors.border}`,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
        pulseTimelines.current.set(table.id, pulse);
      }

      prevStatus.current.set(table.id, table.status);
    });

    return () => {
      newTweens.forEach((tween) => tween.kill());
    };
  }, [tables]);

  // Cleanup all pulses on unmount
  useEffect(() => {
    return () => {
      pulseTimelines.current.forEach((tween) => tween.kill());
      pulseTimelines.current.clear();
    };
  }, []);

  return (
    <section className="space-y-6">
      <header className="app-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="section-title">Mapa de mesas</h2>
            <p className="section-subtitle">Control visual de estados en tiempo real.</p>
          </div>
          {/* Live status legend */}
          <div className="flex flex-wrap gap-3">
            {(Object.entries(statusLabels) as [TableStatus, string][]).map(([status, label]) => {
              const count = tables.filter((t) => t.status === status).length;
              const colors = STATUS_COLORS[status];
              return (
                <div
                  key={status}
                  className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                  style={{
                    borderColor: colors.border,
                    color: colors.border,
                    backgroundColor: colors.bg
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colors.border }}
                  />
                  {label}
                  <span className="font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <div
        ref={gridRef}
        className="app-card grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {tables.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-sm text-muted">No hay mesas registradas aún.</p>
            <p className="mt-1 text-xs text-muted opacity-60">Usa el formulario para crear tu primera mesa.</p>
          </div>
        ) : null}

        {tables.map((table) => {
          const colors = STATUS_COLORS[table.status];
          const isSelected = table.id === selectedTableId;

          return (
            <button
              key={table.id}
              type="button"
              data-table-card
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
              className="group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-transform duration-200 hover:-translate-y-1"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.bg,
                boxShadow: isSelected
                  ? `0 0 0 3px ${colors.glow}, 0 8px 32px ${colors.glow}`
                  : 'none'
              }}
            >
              {/* Status indicator dot */}
              <div
                className="absolute right-4 top-4 h-3 w-3 rounded-full"
                style={{
                  backgroundColor: colors.border,
                  boxShadow: `0 0 8px ${colors.glow}`
                }}
              />

              <div className="flex w-full items-center justify-between pr-6">
                <span className="text-lg font-semibold">{table.label}</span>
              </div>

              <div className="flex w-full items-center justify-between">
                <span
                  className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest font-semibold"
                  style={{
                    borderColor: colors.border,
                    color: colors.border,
                    backgroundColor: colors.bg
                  }}
                >
                  {statusLabels[table.status]}
                </span>
                <span className="text-xs text-muted">
                  {table.capacity ? `${table.capacity} pax` : '–'}
                </span>
              </div>

              {/* Order indicator for occupied tables */}
              {table.currentOrderId ? (
                <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted">
                  <svg className="h-3 w-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Orden activa
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Comanda modal */}
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
              {selectedTable.currentOrderId
                ? `Orden #${selectedTable.currentOrderId.slice(0, 8)}… vinculada a esta mesa.`
                : 'Sin orden vinculada todavía. Crea una venta desde el POS para vincularla.'}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
