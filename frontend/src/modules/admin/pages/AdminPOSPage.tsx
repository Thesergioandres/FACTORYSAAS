import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '../../../shared/animations/gsapConfig';
import { usePosSales, type PosSaleItem } from '../../hosteleria/hooks/usePosSales';
import { useTables } from '../../hosteleria/hooks/useTables';

type CartItem = PosSaleItem;

const STORAGE_KEY = 'essence_pos_pending_sales';
const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'mixed', label: 'Mixto' }
];

function readQueue(): CartItem[][] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[][];
  } catch {
    return [];
  }
}

function writeQueue(queue: CartItem[][]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function AdminPOSPage() {
  const { products, productsLoading, productsError, createSale } = usePosSales();
  const { tables } = useTables();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingSales, setPendingSales] = useState<CartItem[][]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [saleSuccess, setSaleSuccess] = useState(false);

  const cobrarBtnRef = useRef<HTMLButtonElement>(null);
  const successOverlayRef = useRef<HTMLDivElement>(null);
  const ticketCardRef = useRef<HTMLDivElement>(null);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const occupiedTables = useMemo(
    () => tables.filter((t) => t.status === 'LIBRE' || t.status === 'OCUPADA'),
    [tables]
  );

  // ── Sync pending offline sales ────────────────
  useEffect(() => {
    setPendingSales(readQueue());
    const handleOnline = () => {
      const queue = readQueue();
      if (!queue.length) return;
      const remaining: CartItem[][] = [];
      Promise.allSettled(
        queue.map((items) =>
          createSale.mutateAsync({
            items,
            paymentMethod: 'offline',
            paymentStatus: 'PAGADA',
            currency: 'COP'
          }).catch(() => {
            remaining.push(items);
          })
        )
      ).then(() => {
        writeQueue(remaining);
        setPendingSales(remaining);
      });
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const addToCart = useCallback((product: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ── GSAP: Success animation ───────────────────
  const animateSuccess = useCallback(() => {
    setSaleSuccess(true);
    const tl = gsap.timeline({
      onComplete: () => setSaleSuccess(false)
    });

    // Button pulse
    if (cobrarBtnRef.current) {
      tl.to(cobrarBtnRef.current, {
        scale: 1.08,
        boxShadow: '0 0 40px rgba(0, 240, 255, 0.7), 0 0 80px rgba(138, 43, 226, 0.4)',
        duration: 0.25,
        ease: 'power2.out'
      });
      tl.to(cobrarBtnRef.current, {
        scale: 1,
        boxShadow: '0 12px 24px var(--glow-primary)',
        duration: 0.35,
        ease: 'back.out(2)'
      });
    }

    // Success overlay flash
    if (successOverlayRef.current) {
      tl.fromTo(
        successOverlayRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
        '-=0.3'
      );
      tl.to(
        successOverlayRef.current,
        { opacity: 0, y: -10, duration: 0.4, ease: 'power2.in', delay: 1.2 }
      );
    }

    // Ticket card shake-away
    if (ticketCardRef.current) {
      tl.to(ticketCardRef.current, {
        x: 8,
        duration: 0.05,
        repeat: 5,
        yoyo: true,
        ease: 'none'
      }, '-=1.5');
    }
  }, []);

  const submitSale = useCallback(async () => {
    if (!cart.length) return;
    try {
      await createSale.mutateAsync({
        items: cart,
        paymentMethod,
        tableId: selectedTableId || undefined,
        paymentStatus: 'PAGADA',
        currency: 'COP'
      });
      animateSuccess();
      clearCart();
      setSelectedTableId('');
    } catch {
      // Offline fallback
      const queue = readQueue();
      queue.push(cart);
      writeQueue(queue);
      setPendingSales(queue);
      clearCart();
    }
  }, [cart, paymentMethod, selectedTableId, createSale, animateSuccess, clearCart]);

  const sendToKitchen = useCallback(async () => {
    if (!cart.length) return;
    try {
      const { apiRequest } = await import('../../../shared/infrastructure/http/apiClient');
      await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          tableLabel: selectedTableId
            ? tables.find((t) => t.id === selectedTableId)?.name || 'Mostrador'
            : 'Mostrador',
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity
          }))
        })
      });
    } catch {
      return;
    }
  }, [cart, selectedTableId, tables]);

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Punto de venta</h2>
        <p className="section-subtitle">Selecciona productos y cobra desde la caja.</p>
        {pendingSales.length ? (
          <p className="mt-3 text-xs text-secondary">
            {pendingSales.length} ventas en cola por falta de conexion. Se sincronizaran al reconectar.
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* ─── Product Grid ─────────────────────── */}
        <div className="app-card">
          <h3 className="text-lg font-semibold">Productos disponibles</h3>
          {productsLoading ? (
            <p className="mt-4 text-sm text-muted">Cargando productos...</p>
          ) : productsError ? (
            <p className="mt-4 text-sm text-secondary">No se pudieron cargar productos.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="app-card-soft text-left transition-transform duration-150 hover:scale-[1.02] active:scale-95"
                  onClick={() => addToCart(product)}
                >
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-muted">{product.category}</p>
                  <p className="mt-2 text-sm text-ink">$ {product.price.toLocaleString()}</p>
                  <p className="text-xs text-muted">Stock: {product.stock}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Ticket / Cart ────────────────────── */}
        <div ref={ticketCardRef} className="app-card relative overflow-hidden">
          {/* Success overlay */}
          <div
            ref={successOverlayRef}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.12), transparent 70%)',
              opacity: 0
            }}
          >
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(138, 43, 226, 0.15))',
                  border: '1px solid rgba(0, 240, 255, 0.4)'
                }}
              >
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-semibold brand-gradient-text">¡Venta registrada!</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold">Ticket actual</h3>
          {cart.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Agrega productos para iniciar una venta.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted">{item.quantity} x $ {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>$ {(item.price * item.quantity).toLocaleString()}</span>
                    <button className="btn-ghost" type="button" onClick={() => removeFromCart(item.productId)}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm text-muted">Total</span>
            <span className="text-xl font-semibold brand-gradient-text">$ {total.toLocaleString()}</span>
          </div>

          {/* Payment method & Table selector */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted uppercase tracking-widest">Método de pago</label>
              <select
                className="select-field mt-1"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-widest">Mesa (opcional)</label>
              <select
                className="select-field mt-1"
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
              >
                <option value="">Mostrador</option>
                {occupiedTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name} ({table.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 grid gap-3">
            <button
              className="btn-secondary w-full"
              type="button"
              onClick={sendToKitchen}
              disabled={cart.length === 0}
            >
              🍳 Enviar a Cocina
            </button>
            <button
              ref={cobrarBtnRef}
              className="btn-primary w-full"
              type="button"
              onClick={submitSale}
              disabled={cart.length === 0 || createSale.isPending}
            >
              {createSale.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Procesando...
                </span>
              ) : saleSuccess ? (
                '✓ Registrada'
              ) : (
                '💰 Cobrar'
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
