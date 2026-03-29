import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { PosService } from '../services/pos.service';
import { IRegisterSalePayload } from '../types';

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const items = useCartStore((state) => state.items);
  const paymentMethod = useCartStore((state) => state.paymentMethod);
  const clearCart = useCartStore((state) => state.clearCart);

  const checkout = async (): Promise<boolean> => {
    if (items.length === 0) {
      setError('El carrito está vacío');
      return false;
    }

    setLoading(true);
    setError(null);

    const payload: IRegisterSalePayload = {
      items: items.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      paymentMethod
    };

    try {
      await PosService.registerSale(payload);
      clearCart();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error procesando la venta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading, error };
};
