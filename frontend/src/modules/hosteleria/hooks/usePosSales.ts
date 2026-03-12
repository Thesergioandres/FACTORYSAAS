import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/infrastructure/http/apiClient';

/**
 * Tipos del dominio POS sincronizados con el backend.
 */
export type PosSaleItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type PosSale = {
  id: string;
  tenantId: string;
  tableId?: string;
  items: PosSaleItem[];
  total: number;
  paymentMethod?: string;
  createdAt: string;
};

export type CreateSalePayload = {
  items: PosSaleItem[];
  paymentMethod?: string;
  tableId?: string;
  paymentStatus?: string;
  currency?: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  active: boolean;
};

/**
 * usePosSales — Custom Hook de Clean Architecture
 *
 * Encapsula toda la lógica de datos del Punto de Venta.
 * Los componentes solo consumen estado y callbacks.
 */
export function usePosSales() {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['inventory', 'pos'],
    queryFn: () => apiRequest<Product[]>('/inventory')
  });

  const salesQuery = useQuery({
    queryKey: ['pos', 'sales'],
    queryFn: () => apiRequest<PosSale[]>('/pos/sales')
  });

  const createSale = useMutation({
    mutationFn: (payload: CreateSalePayload) =>
      apiRequest<{ sale: PosSale }>('/pos/sales', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'pos'] });
      // También invalida mesas para que el mapa refleje la vinculación
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    }
  });

  const availableProducts = (productsQuery.data ?? []).filter(
    (item) => item.active && item.stock > 0
  );

  return {
    products: availableProducts,
    productsLoading: productsQuery.isLoading,
    productsError: productsQuery.isError,
    sales: salesQuery.data ?? [],
    createSale
  };
}
