import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  addItemOptimistic: (item: Omit<CartItem, 'quantity'>, quantity?: number, confirm?: () => Promise<unknown>) => void;
  removeItem: (id: string, quantity?: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  toastMessage: string | null;
};

type CartProviderProps = {
  tenantId?: string | null;
  children: React.ReactNode;
};

const CartContext = createContext<CartState | undefined>(undefined);

const getStorageKey = (tenantId?: string | null) => {
  return tenantId ? `cart:${tenantId}` : 'cart:guest';
};

export function CartProvider({ tenantId, children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const previousTenantId = useRef<string | null | undefined>(tenantId);

  useEffect(() => {
    const storageKey = getStorageKey(tenantId);
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(parsed);
      } catch {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, [tenantId]);

  useEffect(() => {
    if (previousTenantId.current !== undefined && previousTenantId.current !== tenantId) {
      setItems([]);
      setIsCartOpen(false);
    }
    previousTenantId.current = tenantId;
  }, [tenantId]);

  useEffect(() => {
    const storageKey = getStorageKey(tenantId);
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, tenantId]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  const addItemOptimistic = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1, confirm?: () => Promise<unknown>) => {
      let previousItems: CartItem[] = [];
      setItems((prev) => {
        previousItems = prev.map((entry) => ({ ...entry }));
        const existing = prev.find((entry) => entry.id === item.id);
        if (existing) {
          return prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, quantity: entry.quantity + quantity }
              : entry
          );
        }
        return [...prev, { ...item, quantity }];
      });
      setIsCartOpen(true);
      setToastMessage('¡Producto añadido!');
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = window.setTimeout(() => {
        setToastMessage(null);
        toastTimeoutRef.current = null;
      }, 2000);

      const confirmPromise = confirm ? confirm() : Promise.resolve();
      confirmPromise.catch(() => {
        setItems(previousItems);
        setToastMessage('No se pudo agregar el producto');
        if (toastTimeoutRef.current) {
          window.clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = window.setTimeout(() => {
          setToastMessage(null);
          toastTimeoutRef.current = null;
        }, 2000);
      });
    },
    []
  );

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      addItemOptimistic(item, quantity);
    },
    [addItemOptimistic]
  );

  const removeItem = useCallback((id: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.id === id);
      if (!existing) return prev;
      if (existing.quantity <= quantity) {
        return prev.filter((entry) => entry.id !== id);
      }
      return prev.map((entry) =>
        entry.id === id
          ? { ...entry, quantity: entry.quantity - quantity }
          : entry
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      addItemOptimistic,
      removeItem,
      clearCart,
      totalAmount,
      totalItems,
      isCartOpen,
      setIsCartOpen,
      toastMessage
    }),
    [items, addItem, addItemOptimistic, removeItem, clearCart, totalAmount, totalItems, isCartOpen, toastMessage]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export type { CartItem };
