import { create } from 'zustand';
import { ICartItem, IProduct } from '../types';

interface CartState {
  items: ICartItem[];
  paymentMethod: 'CASH' | 'CREDIT';
  addItem: (product: IProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setPaymentMethod: (method: 'CASH' | 'CREDIT') => void;
  clearCart: () => void;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  paymentMethod: 'CASH',
  addItem: (product) => set((state) => {
    const existing = state.items.find((i) => i.product.id === product.id);
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    return { items: [...state.items, { product, quantity: 1 }] };
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter((i) => i.product.id !== productId)
  })),
  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map((i) =>
      i.product.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i
    )
  })),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  clearCart: () => set({ items: [], paymentMethod: 'CASH' }),
  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }
}));
