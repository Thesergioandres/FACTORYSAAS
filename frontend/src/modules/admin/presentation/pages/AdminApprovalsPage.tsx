import { useEffect, useState } from 'react';
import { apiRequest } from '../../../../shared/infrastructure/http/apiClient';
import { AdminNav } from '../components/AdminNav';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'GOD' | 'ADMIN' | 'STAFF' | 'CLIENT';
  approved: boolean;
};

export function AdminApprovalsPage() {
  const [pending, setPending] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadPending = async () => {
    try {
      const data = await apiRequest<User[]>('/users/pending');
      setPending(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar pendientes');
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const approveUser = async (id: string) => {
    await apiRequest(`/users/${id}/approve`, { method: 'PATCH' });
    await loadPending();
  };

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Aprobaciones</h2>
        <p className="section-subtitle">Usuarios esperando acceso.</p>
      </header>

      <AdminNav />

      {error ? <p className="app-card-soft text-red-200">{error}</p> : null}

      <div className="space-y-3">
        {pending.length === 0 ? <p className="text-sm text-zinc-400">No hay pendientes.</p> : null}
        {pending.map((user) => (
          <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-zinc-400">{user.email} · {user.role}</p>
            <button className="btn-secondary mt-3" onClick={() => approveUser(user.id)}>
              Aprobar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
