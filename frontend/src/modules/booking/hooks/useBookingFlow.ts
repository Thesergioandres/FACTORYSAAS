import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/infrastructure/http/apiClient';

// ── Domain Types ─────────────────────────────────────────
export type BookingStep = 'SERVICE' | 'PROFESSIONAL' | 'DATETIME' | 'CLIENT_DATA';

export type ServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  active: boolean;
};

export type StaffOption = {
  id: string;
  name: string;
  role: string;
};

export type StaffSchedule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type ClientData = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
};

export type BookingState = {
  step: BookingStep;
  selectedService: ServiceOption | null;
  selectedStaff: StaffOption | null;
  selectedDate: string;       // ISO date (YYYY-MM-DD)
  selectedTime: string;       // HH:mm
  clientData: ClientData;
};

export type BookingResult = {
  appointment: { id: string; startAt: string; endAt: string; status: string };
  trustPoints: number;
  message: string;
};

const STEP_ORDER: BookingStep[] = ['SERVICE', 'PROFESSIONAL', 'DATETIME', 'CLIENT_DATA'];

const INITIAL_CLIENT: ClientData = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  notes: ''
};

/**
 * useBookingFlow — Clean Architecture Hook (Motor de Reservas B2C)
 *
 * Maneja el estado completo del formulario multi-paso:
 *   Paso 1 → Servicio
 *   Paso 2 → Profesional (skill-based routing)
 *   Paso 3 → Fecha y Hora
 *   Paso 4 → Datos del Cliente
 *
 * Consume endpoints públicos del backend. El `tenantId` se infiere
 * del contexto, nunca lo ingresa el cliente.
 */
export function useBookingFlow(tenantId: string, branchId?: string) {
  const [state, setState] = useState<BookingState>({
    step: 'SERVICE',
    selectedService: null,
    selectedStaff: null,
    selectedDate: '',
    selectedTime: '',
    clientData: { ...INITIAL_CLIENT }
  });

  // ── Step index helpers ──────────────────────────────
  const currentIndex = STEP_ORDER.indexOf(state.step);
  const totalSteps = STEP_ORDER.length;
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEP_ORDER.length - 1;
  const progress = ((currentIndex + 1) / totalSteps) * 100;

  // ── API: Services ───────────────────────────────────
  const servicesQuery = useQuery({
    queryKey: ['booking', 'services', tenantId],
    queryFn: () => apiRequest<ServiceOption[]>(`/services/public?tenantId=${tenantId}`),
    enabled: !!tenantId
  });

  // ── API: Staff ──────────────────────────────────────
  const staffQuery = useQuery({
    queryKey: ['booking', 'staff'],
    queryFn: () => apiRequest<StaffOption[]>('/users/public/staff'),
    enabled: state.step === 'PROFESSIONAL' || state.step === 'DATETIME'
  });

  // ── API: Staff schedules ────────────────────────────
  const schedulesQuery = useQuery({
    queryKey: ['booking', 'schedules', state.selectedStaff?.id],
    queryFn: () =>
      apiRequest<StaffSchedule[]>(`/staff/${state.selectedStaff!.id}/schedules`),
    enabled: !!state.selectedStaff?.id && state.step === 'DATETIME'
  });

  // ── API: Submit booking ─────────────────────────────
  const submitMutation = useMutation({
    mutationFn: (data: {
      tenantId: string;
      branchId: string;
      staffId: string;
      serviceId: string;
      startAt: string;
      clientName: string;
      clientEmail: string;
      clientPhone: string;
      notes?: string;
    }) =>
      apiRequest<BookingResult>('/appointments/public', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  });

  // ── Navigation ──────────────────────────────────────
  const goNext = useCallback(() => {
    setState((prev) => {
      const idx = STEP_ORDER.indexOf(prev.step);
      if (idx >= STEP_ORDER.length - 1) return prev;
      return { ...prev, step: STEP_ORDER[idx + 1] };
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      const idx = STEP_ORDER.indexOf(prev.step);
      if (idx <= 0) return prev;
      return { ...prev, step: STEP_ORDER[idx - 1] };
    });
  }, []);

  const goToStep = useCallback((step: BookingStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  // ── Selections ──────────────────────────────────────
  const selectService = useCallback((service: ServiceOption) => {
    setState((prev) => ({
      ...prev,
      selectedService: service,
      step: 'PROFESSIONAL'
    }));
  }, []);

  const selectStaff = useCallback((staff: StaffOption) => {
    setState((prev) => ({
      ...prev,
      selectedStaff: staff,
      selectedDate: '',
      selectedTime: '',
      step: 'DATETIME'
    }));
  }, []);

  const selectDateTime = useCallback((date: string, time: string) => {
    setState((prev) => ({
      ...prev,
      selectedDate: date,
      selectedTime: time,
      step: 'CLIENT_DATA'
    }));
  }, []);

  const updateClientData = useCallback((field: keyof ClientData, value: string) => {
    setState((prev) => ({
      ...prev,
      clientData: { ...prev.clientData, [field]: value }
    }));
  }, []);

  // ── Validation ──────────────────────────────────────
  const canAdvance = useMemo(() => {
    switch (state.step) {
      case 'SERVICE':
        return !!state.selectedService;
      case 'PROFESSIONAL':
        return !!state.selectedStaff;
      case 'DATETIME':
        return !!state.selectedDate && !!state.selectedTime;
      case 'CLIENT_DATA':
        return !!(
          state.clientData.clientName.trim() &&
          state.clientData.clientEmail.trim() &&
          state.clientData.clientPhone.trim()
        );
      default:
        return false;
    }
  }, [state]);

  // ── Submit ──────────────────────────────────────────
  const submitBooking = useCallback(async () => {
    if (!state.selectedService || !state.selectedStaff || !state.selectedDate || !state.selectedTime) {
      return;
    }

    const startAt = new Date(`${state.selectedDate}T${state.selectedTime}:00`).toISOString();

    return submitMutation.mutateAsync({
      tenantId,
      branchId: branchId || tenantId,
      staffId: state.selectedStaff.id,
      serviceId: state.selectedService.id,
      startAt,
      clientName: state.clientData.clientName,
      clientEmail: state.clientData.clientEmail,
      clientPhone: state.clientData.clientPhone,
      notes: state.clientData.notes
    });
  }, [state, tenantId, branchId, submitMutation]);

  // ── Reset ───────────────────────────────────────────
  const reset = useCallback(() => {
    setState({
      step: 'SERVICE',
      selectedService: null,
      selectedStaff: null,
      selectedDate: '',
      selectedTime: '',
      clientData: { ...INITIAL_CLIENT }
    });
    submitMutation.reset();
  }, [submitMutation]);

  return {
    // State
    state,
    currentIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    progress,
    canAdvance,

    // Data
    services: servicesQuery.data ?? [],
    servicesLoading: servicesQuery.isLoading,
    staff: staffQuery.data ?? [],
    staffLoading: staffQuery.isLoading,
    schedules: schedulesQuery.data ?? [],
    schedulesLoading: schedulesQuery.isLoading,

    // Actions
    selectService,
    selectStaff,
    selectDateTime,
    updateClientData,
    goNext,
    goBack,
    goToStep,
    submitBooking,
    reset,

    // Mutation state
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error?.message ?? null,
    submitResult: submitMutation.data ?? null,
    isSuccess: submitMutation.isSuccess
  };
}
