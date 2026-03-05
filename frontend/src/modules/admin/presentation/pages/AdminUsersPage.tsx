import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../../../../shared/infrastructure/http/apiClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import { AdminNav } from '../components/AdminNav';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'GOD' | 'ADMIN' | 'STAFF' | 'CLIENT';
  active: boolean;
  whatsappConsent: boolean;
  approved: boolean;
};

export function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'STAFF', password: '' });

  const loadUsers = async () => {
    try {
      const data = await apiRequest<User[]>('/users');
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar usuarios');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await apiRequest<User>('/users/admin', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setForm({ name: '', email: '', phone: '', role: 'STAFF', password: '' });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear usuario');
    }
  };

  const updateUser = async (id: string, patch: Partial<User> & { password?: string }) => {
    setError(null);
    try {
      await apiRequest<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar usuario');
    }
  };

  const approveUser = async (id: string) => {
    setError(null);
    try {
      await apiRequest<User>(`/users/${id}/approve`, { method: 'PATCH' });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aprobar usuario');
    }
  };

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Usuarios</h2>
        <p className="section-subtitle">Gestiona staff, clientes y administradores.</p>
      </header>

      <AdminNav />

      {error ? <p className="app-card-soft text-red-200">{error}</p> : null}

      <form className="app-card grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
        <label className="text-xs text-zinc-400">
          Nombre
          <input
            className="input-field mt-2"
            placeholder="Nombre"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </label>
        <label className="text-xs text-zinc-400">
          Email
          <input
            className="input-field mt-2"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>
        <label className="text-xs text-zinc-400">
          Telefono
          <input
            className="input-field mt-2"
            placeholder="Telefono (+57...)"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            required
          />
        </label>
        <label className="text-xs text-zinc-400">
          Rol
          <select
            className="select-field mt-2"
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
          >
            {user?.role === 'GOD' ? <option value="GOD">God</option> : null}
            <option value="STAFF">Staff</option>
            <option value="CLIENT">Cliente</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        <label className="text-xs text-zinc-400">
          Contrasena
          <input
            className="input-field mt-2"
            type="password"
            placeholder="Contrasena"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </label>
        <div className="flex items-end">
          <button className="btn-primary" type="submit">
            Crear usuario
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-zinc-400">{user.email} · {user.phone}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="select-field !py-1 !text-xs"
                  value={user.role}
                  onChange={(event) => updateUser(user.id, { role: event.target.value as User['role'] })}
                >
                  {user?.role === 'GOD' ? <option value="GOD">GOD</option> : null}
                  <option value="ADMIN">ADMIN</option>
                  <option value="STAFF">STAFF</option>
                  <option value="CLIENT">CLIENT</option>
                </select>
                <button
                  className="btn-ghost"
                  onClick={() => updateUser(user.id, { active: !user.active })}
                >
                  {user.active ? 'Desactivar' : 'Activar'}
                </button>
                {user?.role === 'GOD' ? (
                  <button
                    className="btn-secondary"
                    onClick={() => approveUser(user.id)}
                    disabled={user.approved}
                  >
                    {user.approved ? 'Aprobado' : 'Aprobar'}
                  </button>
                ) : null}
                <button
                  className="btn-ghost"
                  onClick={() => updateUser(user.id, { whatsappConsent: !user.whatsappConsent })}
                >
                  WhatsApp {user.whatsappConsent ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
