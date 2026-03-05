import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../../../../shared/infrastructure/http/apiClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useLabels } from '../../../../shared/hooks/useLabels';

type Appointment = {
  id: string;
  startAt: string;
  status: string;
  clientId: string;
};

type Schedule = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type Block = {
  id?: string;
  startAt: string;
  endAt: string;
  reason?: string;
};

export function StaffDashboardPage() {
  const { user } = useAuth();
  const labels = useLabels();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '18:00' });
  const [blockForm, setBlockForm] = useState({ startAt: '', endAt: '', reason: '' });

  const loadAll = async () => {
    if (!user) return;
    try {
      const [appointmentsData, schedulesData, blocksData] = await Promise.all([
        apiRequest<Appointment[]>('/appointments'),
        apiRequest<Schedule[]>(`/staff/${user.id}/schedules`),
        apiRequest<Block[]>(`/staff/${user.id}/blocks`)
      ]);
      setAppointments(appointmentsData);
      setSchedules(schedulesData);
      setBlocks(blocksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la informacion');
    }
  };

  useEffect(() => {
    if (user?.role === 'STAFF') {
      loadAll();
    }
  }, [user]);

  const updateStatus = async (id: string, nextStatus: string) => {
    await apiRequest(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ nextStatus })
    });
    await loadAll();
  };

  const saveSchedule = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    await apiRequest(`/staff/${user.id}/schedules`, {
      method: 'POST',
      body: JSON.stringify(scheduleForm)
    });
    await loadAll();
  };

  const addBlock = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    await apiRequest(`/staff/${user.id}/blocks`, {
      method: 'POST',
      body: JSON.stringify({
        startAt: new Date(blockForm.startAt).toISOString(),
        endAt: new Date(blockForm.endAt).toISOString(),
        reason: blockForm.reason
      })
    });
    setBlockForm({ startAt: '', endAt: '', reason: '' });
    await loadAll();
  };

  if (!user || user.role !== 'STAFF') {
    return (
      <section className="app-card">
        <h2 className="section-title">Panel {labels.staff}</h2>
        <p className="section-subtitle">Disponible solo para {labels.staff.toLowerCase()} autenticado.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Agenda de {labels.staffPlural}</h2>
        <p className="section-subtitle">Gestiona disponibilidad y estado de {labels.appointment.toLowerCase()}s.</p>
      </header>

      {error ? <p className="app-card-soft text-red-200">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Horarios de trabajo</h3>
          <form className="app-card grid gap-3" onSubmit={saveSchedule}>
            <select
              className="select-field"
              value={scheduleForm.dayOfWeek}
              onChange={(event) => setScheduleForm((prev) => ({ ...prev, dayOfWeek: Number(event.target.value) }))}
            >
              <option value={1}>Lunes</option>
              <option value={2}>Martes</option>
              <option value={3}>Miercoles</option>
              <option value={4}>Jueves</option>
              <option value={5}>Viernes</option>
              <option value={6}>Sabado</option>
              <option value={0}>Domingo</option>
            </select>
            <input
              className="input-field"
              value={scheduleForm.startTime}
              onChange={(event) => setScheduleForm((prev) => ({ ...prev, startTime: event.target.value }))}
            />
            <input
              className="input-field"
              value={scheduleForm.endTime}
              onChange={(event) => setScheduleForm((prev) => ({ ...prev, endTime: event.target.value }))}
            />
            <button className="btn-primary w-fit" type="submit">
              Guardar horario
            </button>
          </form>

          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div key={`${schedule.dayOfWeek}-${schedule.startTime}`} className="rounded-xl border border-white/10 bg-black/40 p-2 text-xs">
                {schedule.dayOfWeek} · {schedule.startTime} - {schedule.endTime}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Bloqueos</h3>
          <form className="app-card grid gap-3" onSubmit={addBlock}>
            <input
              type="datetime-local"
              className="input-field"
              value={blockForm.startAt}
              onChange={(event) => setBlockForm((prev) => ({ ...prev, startAt: event.target.value }))}
              required
            />
            <input
              type="datetime-local"
              className="input-field"
              value={blockForm.endAt}
              onChange={(event) => setBlockForm((prev) => ({ ...prev, endAt: event.target.value }))}
              required
            />
            <input
              className="input-field"
              placeholder="Motivo"
              value={blockForm.reason}
              onChange={(event) => setBlockForm((prev) => ({ ...prev, reason: event.target.value }))}
            />
            <button className="btn-primary w-fit" type="submit">
              Agregar bloqueo
            </button>
          </form>

          <div className="space-y-2">
            {blocks.map((block) => (
              <div key={`${block.startAt}-${block.endAt}`} className="rounded-xl border border-white/10 bg-black/40 p-2 text-xs">
                {new Date(block.startAt).toLocaleString()} - {new Date(block.endAt).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{labels.appointment}s asignadas</h3>
        {appointments.map((appointment) => (
          <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">{new Date(appointment.startAt).toLocaleString()}</p>
            <p className="text-xs text-zinc-400">Estado: {appointment.status}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="btn-ghost" onClick={() => updateStatus(appointment.id, 'CONFIRMADA')}>
                Confirmar
              </button>
              <button className="btn-secondary" onClick={() => updateStatus(appointment.id, 'COMPLETADA')}>
                Completar
              </button>
              <button className="btn-ghost" onClick={() => updateStatus(appointment.id, 'NO_ASISTIO')}>
                No asistio
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
