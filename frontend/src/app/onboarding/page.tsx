'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/shared/store/useSessionStore';

export default function OnboardingPage() {
  const router = useRouter();
  const { token, updateTenantConfig } = useSessionStore();
  const [formData, setFormData] = useState({ name: '', slug: '', primaryColor: '#2563eb' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.slug.includes(' ') || !/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('El subdominio (slug) no puede contener espacios ni caracteres especiales. Ej: mi-empresa');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/tenants/onboarding`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error guardando onboarding');

      updateTenantConfig({ name: formData.name, slug: formData.slug, primaryColor: formData.primaryColor });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-white/10 rounded-xl p-8 shadow-2xl shadow-blue-500/10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-6">
          Wizard de Configuración (Onboarding)
        </h1>
        <p className="text-zinc-400 mb-8">
          ¡Felicidades! Tu cuenta ha sido aprobada. Por favor, completa la información de tu negocio 
          para personalizar tu espacio (Nombre, Nicho, Logo, Dirección, Teléfono, Colores).
        </p>

        {error && <div className="p-4 mb-6 bg-red-900/50 text-red-200 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre final de la empresa</label>
            <input 
              type="text" 
              className="w-full p-3 rounded bg-zinc-800 border focus:border-cyan-500 outline-none transition-colors border-white/10" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Subdominio Único (Slug B2C)</label>
            <div className="flex items-center">
              <span className="p-3 bg-zinc-800 text-zinc-500 border border-white/10 border-r-0 rounded-l">factory.com/</span>
              <input 
                type="text" 
                className="w-full p-3 rounded-r bg-zinc-800 border focus:border-cyan-500 outline-none transition-colors border-white/10" 
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                placeholder="mi-empresa"
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Color Corporativo (HEX)</label>
            <div className="flex gap-4 items-center">
              <input 
                type="color" 
                className="w-12 h-12 rounded cursor-pointer border-none bg-transparent" 
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              />
              <span className="text-zinc-500 uppercase font-mono">{formData.primaryColor}</span>
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 p-4 rounded-lg text-white font-bold transition-colors disabled:opacity-50 mt-8 shadow-lg shadow-cyan-900/20" 
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Finalizar y Entrar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
