import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/infrastructure/http/apiClient';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  active: boolean;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export function AdminPOSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingSales, setPendingSales] = useState<CartItem[][]>([]);

  const STORAGE_KEY = 'essence_pos_pending_sales';

  const readQueue = () => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [] as CartItem[][];
    try {
      return JSON.parse(raw) as CartItem[][];
    } catch {
      return [] as CartItem[][];
    }
  };

  const writeQueue = (queue: CartItem[][]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    setPendingSales(queue);
  };

  const productsQuery = useQuery({
    queryKey: ['inventory', 'pos'],
    queryFn: () => apiRequest<Product[]>('/inventory')
  });

  const availableProducts = useMemo(() => {
    return (productsQuery.data || []).filter((item) => item.active && item.stock > 0);
  }, [productsQuery.data]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const syncPending = async () => {
    const queue = readQueue();
    if (!queue.length) return;
    const remaining: CartItem[][] = [];

    for (const items of queue) {
      try {
        await apiRequest('/pos/sales', {
          method: 'POST',
          body: JSON.stringify({
            items,
            paymentMethod: 'offline',
            paymentStatus: 'PAGADA',
            currency: 'COP'
          })
        });
      } catch {
        remaining.push(items);
      }
    }

    writeQueue(remaining);
  };

  useEffect(() => {
    writeQueue(readQueue());
    const handleOnline = () => {
      syncPending().catch(() => undefined);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const addToCart = (product: Product) => {
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
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const submitSale = async () => {
    if (!cart.length) return;
    try {
      await apiRequest('/pos/sales', {
        method: 'POST',
        body: JSON.stringify({
          items: cart,
          paymentMethod: 'cash',
          paymentStatus: 'PAGADA',
          currency: 'COP'
        })
      });
      clearCart();
    } catch {
      const queue = readQueue();
      queue.push(cart);
      writeQueue(queue);
      clearCart();
    }
  };

  const sendToKitchen = async () => {
    if (!cart.length) return;
    try {
      await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          tableLabel: 'Mostrador',
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity
          }))
        })
      });
    } catch {
      return;
    }
  };

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
        <div className="app-card">
          <h3 className="text-lg font-semibold">Productos disponibles</h3>
          {productsQuery.isLoading ? (
            <p className="mt-4 text-sm text-muted">Cargando productos...</p>
          ) : productsQuery.isError ? (
            <p className="mt-4 text-sm text-secondary">No se pudieron cargar productos.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availableProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="app-card-soft text-left"
                  onClick={() => addToCart(product)}
                >
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-muted">{product.category}</p>
                  <p className="mt-2 text-sm text-ink">$ {product.price}</p>
                  <p className="text-xs text-muted">Stock: {product.stock}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="app-card">
          <h3 className="text-lg font-semibold">Ticket actual</h3>
          {cart.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Agrega productos para iniciar una venta.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted">{item.quantity} x $ {item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>$ {item.price * item.quantity}</span>
                    <button className="btn-ghost" type="button" onClick={() => removeFromCart(item.productId)}>
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm text-muted">Total</span>
            <span className="text-xl font-semibold">$ {total}</span>
          </div>

          <div className="mt-4 grid gap-3">
            <button className="btn-secondary w-full" type="button" onClick={sendToKitchen} disabled={cart.length === 0}>
              Enviar a Cocina
            </button>
            <button className="btn-primary w-full" type="button" onClick={submitSale} disabled={cart.length === 0}>
              Cobrar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
