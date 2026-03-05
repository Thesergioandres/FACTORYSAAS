import { FormEvent, useEffect, useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { apiRequest } from '../../../../shared/infrastructure/http/apiClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import { LoginCard } from '../../../../shared/components/LoginCard';

type User = {
  id: string;
  name: string;
  role: 'GOD' | 'ADMIN' | 'STAFF' | 'CLIENT';
  email?: string;
  approved?: boolean;
};

type Service = {
  id: string;
  name: string;
};

export function AppointmentsPage() {
  const { user: sessionUser, logout, loading: sessionLoading } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branchId, setBranchId] = useState('default_branch');
  const [staffId, setStaffId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [notes, setNotes] = useState('');
  const { appointments, loading, error, addAppointment } = useAppointments(!!sessionUser);

  useEffect(() => {
    async function loadOptions() {
      const [staffData, servicesData] = await Promise.all([
        apiRequest<User[]>('/users/public/staff'),
        apiRequest<Service[]>('/services?onlyActive=true')
      ]);

      setStaff(staffData);
      setServices(servicesData);

      if (staffData[0]) {
        setStaffId(staffData[0].id);
      }

      if (servicesData[0]) {
        setServiceId(servicesData[0].id);
      }
    }

    loadOptions();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!startAt || !staffId || !serviceId || !branchId) {
      return;
    }

    await addAppointment({
      branchId,
      staffId,
      serviceId,
      startAt: new Date(startAt).toISOString(),
      notes
    });

    setNotes('');
  };

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Agendar cita</h2>
        <p className="section-subtitle">Reserva rapida con disponibilidad en tiempo real.</p>
      </header>

      {!sessionUser ? (
        <LoginCard title="Inicia sesion como cliente" subtitle="Necesitas autenticarte para gestionar tus citas." />
      ) : (
        <div className="app-card-soft flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-300">
            Sesion activa: {sessionUser.name} ({sessionUser.role})
          </p>
          <button type="button" className="btn-ghost" onClick={logout}>
            Cerrar sesion
          </button>
        </div>
      )}

      <form className="app-card grid gap-4 md:max-w-2xl" onSubmit={handleSubmit}>
        <label className="text-xs text-zinc-400">
          Sede (Lugar de atención)
          <select
            className="select-field mt-2"
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
            disabled={!sessionUser || sessionLoading}
          >
            <option value="default_branch">Sede Principal Noir</option>
            <option value="sur_branch">Sede Sur</option>
          </select>
        </label>

        <label className="text-xs text-zinc-400">
          Staff
          <select
            className="select-field mt-2"
            value={staffId}
            onChange={(event) => setStaffId(event.target.value)}
            disabled={!sessionUser || sessionLoading}
          >
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-zinc-400">
          Servicio
          <select
            className="select-field mt-2"
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            disabled={!sessionUser || sessionLoading}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-zinc-400" htmlFor="startAt">
          Fecha y hora
          <input
            id="startAt"
            type="datetime-local"
            className="input-field mt-2"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            required
            disabled={!sessionUser || sessionLoading}
          />
        </label>

        <label className="text-xs text-zinc-400" htmlFor="notes">
          Notas
          <textarea
            id="notes"
            className="textarea-field mt-2"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            disabled={!sessionUser || sessionLoading}
          />
        </label>

        <button
          type="submit"
          className="btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!sessionUser || sessionLoading}
        >
          Reservar
        </button>
      </form>

      {error && <p className="app-card-soft text-red-200">{error}</p>}

      <div className="app-card space-y-3">
        <h3 className="text-lg font-semibold">Mis citas</h3>
        {loading ? (
          <p className="text-zinc-400">Cargando...</p>
        ) : (
          <ul className="space-y-2">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p>{new Date(appointment.startAt).toLocaleString()}</p>
                <p className="text-sm text-zinc-300">Estado: {appointment.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
