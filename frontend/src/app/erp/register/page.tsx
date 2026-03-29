'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ERPRegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/register-tenant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      setMessage({ text: 'Registro exitoso. Esperando aprobación de Essence Factory.', type: 'success' });
      setFormData({ name: '', email: '', password: '' });
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Registro ERP</h1>
        <p className="text-zinc-400 text-center mb-6 text-sm">
          Crea tu negocio. Al finalizar, tu cuenta se creará con estado PENDING sujeto a validación del Administrador.
        </p>

        {message.text && (
          <div className={`p-4 mb-6 rounded ${message.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-emerald-900/50 text-emerald-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Nombre de la empresa" 
            className="w-full p-3 rounded bg-zinc-800 border focus:border-blue-500 outline-none transition-colors border-white/10" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required 
            disabled={loading}
          />
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            className="w-full p-3 rounded bg-zinc-800 border focus:border-blue-500 outline-none transition-colors border-white/10" 
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required 
            disabled={loading}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-3 rounded bg-zinc-800 border focus:border-blue-500 outline-none transition-colors border-white/10" 
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required 
            disabled={loading}
          />
          <button 
            type="submit"
            className="w-full bg-blue-600 p-3 rounded text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/erp/login" className="text-sm text-zinc-500 hover:text-white transition-colors">
            ¿Ya tienes una cuenta? Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
