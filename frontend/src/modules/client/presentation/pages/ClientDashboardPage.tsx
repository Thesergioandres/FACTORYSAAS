import { useEffect, useState } from 'react';
import { apiRequest } from '../../../../shared/infrastructure/http/apiClient';
import { useAuth } from '../../../../shared/context/AuthContext';

type Appointment = {
  id: string;
  startAt: string;
  status: string;
  staffId: string;
};

export function ClientDashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = async () => {
    try {
      const data = await apiRequest<Appointment[]>('/appointments');
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las citas');
    }
  };

  useEffect(() => {
    if (user?.role === 'CLIENT') {
      loadAppointments();
    }
  }, [user]);

  const cancelAppointment = async (id: string) => {
    await apiRequest(`/appointments/${id}/cancel`, { method: 'POST' });
    await loadAppointments();
  };

  const rescheduleAppointment = async (id: string) => {
    const nextDate = prompt('Nueva fecha ISO (YYYY-MM-DDTHH:mm)');
    if (!nextDate) return;
    await apiRequest(`/appointments/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ startAt: new Date(nextDate).toISOString() })
    });
    await loadAppointments();
  };

  if (!user || user.role !== 'CLIENT') {
    return (
      <section className="app-card">
        <h2 className="section-title">Mi panel</h2>
        <p className="section-subtitle">Disponible solo para clientes autenticados.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Mis citas</h2>
        <p className="section-subtitle">Gestiona tus reservas activas.</p>
      </header>

      {error ? <p className="app-card-soft text-red-200">{error}</p> : null}

      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{new Date(appointment.startAt).toLocaleString()}</p>
                <p className="text-xs text-zinc-400">Estado: {appointment.status}</p>
              </div>
              <span className="status-pill">Reserva activa</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn-ghost" onClick={() => cancelAppointment(appointment.id)}>
                Cancelar
              </button>
              <button className="btn-secondary" onClick={() => rescheduleAppointment(appointment.id)}>
                Reprogramar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
