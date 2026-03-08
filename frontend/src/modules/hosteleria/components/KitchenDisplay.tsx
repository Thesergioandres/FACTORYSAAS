import { useEffect, useMemo, useRef, useState } from 'react';
import { getAuthToken, isAuthTokenValid } from '../../../shared/infrastructure/http/session';
import { gsap } from '../../../shared/animations/gsapConfig';

type KitchenOrder = {
  id: string;
  tableId?: string;
  tableLabel?: string;
  items: Array<{ name: string; quantity: number; notes?: string }>;
  status: 'NEW' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
};

type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'idle';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export function KitchenDisplay() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const alertRef = useRef<HTMLDivElement | null>(null);
  const prevCount = useRef(0);

  const summary = useMemo(() => {
    const totals = { NEW: 0, IN_PROGRESS: 0, DONE: 0 } as Record<KitchenOrder['status'], number>;
    orders.forEach((order) => {
      totals[order.status] += 1;
    });
    return totals;
  }, [orders]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token || !isAuthTokenValid(token)) {
      setStatus('error');
      return undefined;
    }

    const streamUrl = `${API_BASE_URL}/orders/stream?token=${encodeURIComponent(token)}`;
    const source = new EventSource(streamUrl);

    setStatus('connecting');

    const handleConnected = () => {
      setStatus('connected');
    };

    const handleOrder = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as KitchenOrder;
        setOrders((prev) => [payload, ...prev].slice(0, 50));
      } catch {
        return;
      }
    };

    const handleError = () => {
      setStatus('error');
    };

    source.addEventListener('connected', handleConnected as EventListener);
    source.addEventListener('order', handleOrder as EventListener);
    source.addEventListener('error', handleError as EventListener);

    return () => {
      source.removeEventListener('connected', handleConnected as EventListener);
      source.removeEventListener('order', handleOrder as EventListener);
      source.removeEventListener('error', handleError as EventListener);
      source.close();
    };
  }, []);

  useEffect(() => {
    if (!alertRef.current) return;
    if (orders.length <= prevCount.current) {
      prevCount.current = orders.length;
      return;
    }
    const tween = gsap.fromTo(
      alertRef.current,
      { boxShadow: '0 0 0 rgba(0,0,0,0)', x: 0 },
      { boxShadow: '0 0 22px var(--primary-glow)', x: 6, duration: 0.12, yoyo: true, repeat: 5 }
    );
    prevCount.current = orders.length;
    return () => {
      tween.kill();
    };
  }, [orders.length]);

  return (
    <section className="space-y-6">
      <header className="app-card" ref={alertRef}>
        <h2 className="section-title">Kitchen Display</h2>
        <p className="section-subtitle">Comandas en tiempo real para cocina.</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
          <span className="app-chip">Estado: {status}</span>
          <span className="app-chip">Nuevas: {summary.NEW}</span>
          <span className="app-chip">En progreso: {summary.IN_PROGRESS}</span>
          <span className="app-chip">Listas: {summary.DONE}</span>
        </div>
      </header>

      {status === 'error' ? (
        <div className="app-card">
          <p className="text-sm text-secondary">Sin conexion a la cocina. Verifica tu sesion y red.</p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {orders.length === 0 ? (
          <div className="app-card">
            <p className="text-sm text-muted">No hay comandas en cola.</p>
          </div>
        ) : (
          orders.map((order) => (
            <article key={order.id} className="app-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">Mesa {order.tableLabel || order.tableId || 'N/A'}</p>
                  <h3 className="text-lg font-semibold">Comanda #{order.id.slice(0, 6).toUpperCase()}</h3>
                </div>
                <span className="status-pill">{order.status}</span>
              </div>
              <div className="mt-4 space-y-2">
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${index}`} className="flex items-start justify-between text-sm">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      {item.notes ? <p className="text-xs text-muted">{item.notes}</p> : null}
                    </div>
                    <span className="text-ink">x {item.quantity}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted">{new Date(order.createdAt).toLocaleTimeString()}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
