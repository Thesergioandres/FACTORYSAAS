import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/infrastructure/http/apiClient';

export type AgendaItem = {
  id: string;
  clientName: string;
  staffName: string;
  serviceName: string;
  startTime: string;
  status: string;
};

async function fetchAgenda() {
  return apiRequest<AgendaItem[]>('/appointments');
}

export function useAgenda() {
  return useQuery({
    queryKey: ['agenda'],
    queryFn: fetchAgenda,
    refetchInterval: 30000
  });
}
