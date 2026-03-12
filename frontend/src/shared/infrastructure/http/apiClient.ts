import { getAuthToken } from './session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Evento global que se dispara cuando el backend devuelve 402 Payment Required.
 * El PaymentBlockedOverlay escucha este evento para mostrar el muro de pago.
 */
export const PAYMENT_REQUIRED_EVENT = 'essence:payment-required';

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const isFormData = init?.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    },
    ...init
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Error inesperado' }));

    // ── 402 INTERCEPTOR: Muro de Pagos B2B ──────────────────────────
    // Cuando el SubscriptionGuard del backend bloquea al tenant moroso,
    // disparamos un evento global para que el Overlay se active.
    if (response.status === 402) {
      window.dispatchEvent(new CustomEvent(PAYMENT_REQUIRED_EVENT, {
        detail: { message: body.message || 'Suscripción suspendida' }
      }));
    }

    throw new Error(body.message || 'Error de red');
  }

  return response.json() as Promise<T>;
}
