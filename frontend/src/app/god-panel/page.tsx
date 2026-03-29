'use client';

import { useState, useEffect } from 'react';
import { useSessionStore } from '@/shared/store/useSessionStore';

type PendingTenant = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  users: Array<{ _id: string; name: string; email: string }>;
};

export default function GodPanelPage() {
  const { token, user } = useSessionStore();
  const [tenants, setTenants] = useState<PendingTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingTenants = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/god/tenants/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error cargando tenants');
      setTenants(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'GOD') {
      fetchPendingTenants();
    } else if (!token) {
      setLoading(false);
      setError('No autenticado');
    }
  }, [token, user]);

  const handleApprove = async (id: string) => {
    if (!confirm('¿Seguro de aprobar este negocio?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/god/tenants/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al aprobar');
      // Refetch
      fetchPendingTenants();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-white min-h-screen bg-black">Cargando panel GOD...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent mb-6">
        Panel de Control Factory (GOD)
      </h1>
      <p className="text-zinc-400 mb-8 max-w-2xl">
        Gestión de negocios PENDING. Al aprobar un negocio, su administrador recibirá acceso a la plataforma (Onboarding).
      </p>

      {error ? (
        <div className="p-4 bg-red-900/50 text-red-200 rounded">{error}</div>
      ) : (
        <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-800 border-b border-white/5">
              <tr>
                <th className="p-4 font-medium text-zinc-300">Empresa</th>
                <th className="p-4 font-medium text-zinc-300">Contacto</th>
                <th className="p-4 font-medium text-zinc-300">Registro</th>
                <th className="p-4 font-medium text-zinc-300">Acción</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t._id} className="border-b border-white/5 hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-zinc-500">{t._id}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{t.email}</div>
                    {t.users[0] && <div className="text-xs text-zinc-500">Admin: {t.users[0].name}</div>}
                  </td>
                  <td className="p-4 text-sm text-zinc-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleApprove(t._id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
                    >
                      Aprobar Acceso
                    </button>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">No hay negocios pendientes de aprobación.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
