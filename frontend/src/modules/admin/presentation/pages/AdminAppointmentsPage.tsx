import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../../shared/infrastructure/http/apiClient';
import { AdminNav } from '../components/AdminNav';

type Appointment = {
  id: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  status: string;
  notes?: string;
};

type User = {
  id: string;
  name: string;
};

type HistoryItem = {
  id: string;
  action: string;
  prevStatus?: string;
  nextStatus?: string;
  prevStartAt?: string;
  nextStartAt?: string;
  prevStaffId?: string;
  nextStaffId?: string;
  createdAt: string;
};

export function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem[] | null>(null);

  const loadAppointments = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('startFrom', new Date(dateFrom).toISOString());
      if (dateTo) params.set('startTo', new Date(dateTo).toISOString());
      const data = await apiRequest<Appointment[]>(`/appointments?${params.toString()}`);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar citas');
    }
  };

  const loadStaff = async () => {
    const data = await apiRequest<User[]>('/users/public/staff');
    setStaff(data);
  };

  useEffect(() => {
    loadAppointments();
    loadStaff();
  }, []);

  const staffMap = useMemo(() => {
    return new Map(staff.map((member) => [member.id, member.name]));
  }, [staff]);

  const updateStatus = async (id: string, nextStatus: string) => {
    setError(null);
    try {
      await apiRequest(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ nextStatus })
      });
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar estado');
    }
  };

  const cancelAppointment = async (id: string) => {
    setError(null);
    try {
      await apiRequest(`/appointments/${id}/cancel`, { method: 'POST' });
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar la cita');
    }
  };

  const rescheduleAppointment = async (id: string, startAt: string) => {
    setError(null);
    try {
      await apiRequest(`/appointments/${id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({ startAt })
      });
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reprogramar la cita');
    }
  };

  const reassignAppointment = async (id: string, newStaffId: string) => {
    setError(null);
    try {
      await apiRequest(`/appointments/${id}/reassign`, {
        method: 'POST',
        body: JSON.stringify({ newStaffId })
      });
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reasignar la cita');
    }
  };

  const showHistory = async (id: string) => {
    const data = await apiRequest<HistoryItem[]>(`/appointments/${id}/history`);
    setSelectedHistory(data);
  };

  const handleFilter = (event: FormEvent) => {
    event.preventDefault();
    loadAppointments();
  };

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Citas</h2>
        <p className="section-subtitle">Reasignacion, estado y agenda global.</p>
      </header>

      <AdminNav />

      {error ? <p className="app-card-soft text-red-200">{error}</p> : null}

      <form className="app-card flex flex-wrap gap-3" onSubmit={handleFilter}>
        <input
          type="date"
          className="input-field"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />
        <input
          type="date"
          className="input-field"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
        />
        <button className="btn-ghost" type="submit">
          Filtrar
        </button>
      </form>

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{new Date(appointment.startAt).toLocaleString()}</p>
                <p className="text-xs text-zinc-400">Staff: {staffMap.get(appointment.staffId) || appointment.staffId}</p>
                <p className="text-xs text-zinc-400">Estado: {appointment.status}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="select-field !py-1 !text-xs"
                  value={appointment.status}
                  onChange={(event) => updateStatus(appointment.id, event.target.value)}
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="CONFIRMADA">CONFIRMADA</option>
                  <option value="COMPLETADA">COMPLETADA</option>
                  <option value="NO_ASISTIO">NO_ASISTIO</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
                <button className="btn-ghost" onClick={() => cancelAppointment(appointment.id)}>
                  Cancelar
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    const nextDate = prompt('Nueva fecha ISO (YYYY-MM-DDTHH:mm)');
                    if (nextDate) {
                      rescheduleAppointment(appointment.id, new Date(nextDate).toISOString());
                    }
                  }}
                >
                  Reprogramar
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => showHistory(appointment.id)}
                >
                  Historial
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                className="select-field !py-1 !text-xs"
                onChange={(event) => {
                  if (event.target.value) {
                    reassignAppointment(appointment.id, event.target.value);
                  }
                }}
                defaultValue=""
              >
                <option value="">Reasignar staff</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-zinc-500">Cliente: {appointment.clientId}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedHistory ? (
        <div className="app-card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Historial de cita</h3>
            <button className="btn-ghost" onClick={() => setSelectedHistory(null)}>
              Cerrar
            </button>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {selectedHistory.map((item) => (
              <li key={item.id} className="rounded-xl border border-white/10 bg-black/40 p-3">
                <p className="text-xs text-zinc-400">{new Date(item.createdAt).toLocaleString()}</p>
                <p className="font-semibold">{item.action}</p>
                {item.nextStatus ? <p>Estado: {item.prevStatus} → {item.nextStatus}</p> : null}
                {item.nextStartAt ? <p>Fecha: {item.prevStartAt} → {item.nextStartAt}</p> : null}
                {item.nextStaffId ? <p>Staff: {item.prevStaffId} → {item.nextStaffId}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
