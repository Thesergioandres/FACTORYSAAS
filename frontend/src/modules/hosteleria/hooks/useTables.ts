import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/infrastructure/http/apiClient';
import type { TableStatus } from '../components/RestaurantMap';

/**
 * Tipos del dominio de Mesas sincronizados con el backend.
 */
export type TableRecord = {
  id: string;
  name: string;
  capacity?: number;
  currentOrderId?: string;
  status: TableStatus;
  updatedAt?: string;
};

/**
 * useTables — Custom Hook de Clean Architecture
 *
 * Encapsula toda la lógica de datos del módulo de Mesas.
 * Los componentes de presentación solo consumen estado y callbacks.
 */
export function useTables() {
  const queryClient = useQueryClient();

  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: () => apiRequest<TableRecord[]>('/tables'),
    refetchInterval: 10_000 // Auto-refresh cada 10s para reflejar cambios en tiempo real
  });

  const createTable = useMutation({
    mutationFn: (payload: { name: string; capacity?: number }) =>
      apiRequest<TableRecord>('/tables', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    }
  });

  const updateStatus = useMutation({
    mutationFn: (payload: { id: string; status: TableStatus; currentOrderId?: string }) =>
      apiRequest<TableRecord>(`/tables/${payload.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: payload.status,
          currentOrderId: payload.currentOrderId
        })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    }
  });

  return {
    tables: tablesQuery.data ?? [],
    isLoading: tablesQuery.isLoading,
    isError: tablesQuery.isError,
    createTable,
    updateStatus
  };
}
