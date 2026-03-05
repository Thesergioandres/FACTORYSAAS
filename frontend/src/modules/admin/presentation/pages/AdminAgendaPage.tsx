import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../../shared/infrastructure/http/apiClient';
import { AdminNav } from '../components/AdminNav';

type Appointment = {
  id: string;
  staffId: string;
  startAt: string;
  status: string;
};

type StaffMember = {
  id: string;
  name: string;
};

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function AdminAgendaPage() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + index);
      return day;
    });
  }, [weekStart]);

  useEffect(() => {
    async function load() {
      const startFrom = new Date(weekStart);
      const startTo = new Date(weekStart);
      startTo.setDate(startTo.getDate() + 7);

      const [appointmentsData, staffData] = await Promise.all([
        apiRequest<Appointment[]>(`/appointments?startFrom=${startFrom.toISOString()}&startTo=${startTo.toISOString()}`),
        apiRequest<StaffMember[]>('/users/public/staff')
      ]);

      setAppointments(appointmentsData);
      setStaff(staffData);
    }

    load();
  }, [weekStart]);

  const staffNames = useMemo(() => new Map(staff.map((member) => [member.id, member.name])), [staff]);

  return (
    <section className="space-y-6">
      <header className="app-card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Agenda semanal</h2>
          <p className="section-subtitle">Vista de citas por dia.</p>
        </div>
        <input
          type="date"
          className="input-field"
          value={weekStart.toISOString().slice(0, 10)}
          onChange={(event) => setWeekStart(startOfWeek(new Date(event.target.value)))}
        />
      </header>

      <AdminNav />

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-7">
        {days.map((day) => (
          <div key={day.toISOString()} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-zinc-400">{day.toLocaleDateString()}</p>
            <ul className="mt-2 space-y-2 text-xs">
              {appointments
                .filter((appointment) => new Date(appointment.startAt).toDateString() === day.toDateString())
                .map((appointment) => (
                  <li key={appointment.id} className="rounded-xl border border-white/10 bg-black/40 p-2">
                    <p>{new Date(appointment.startAt).toLocaleTimeString()}</p>
                    <p className="text-zinc-400">{staffNames.get(appointment.staffId) || appointment.staffId}</p>
                    <p className="text-zinc-400">{appointment.status}</p>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
