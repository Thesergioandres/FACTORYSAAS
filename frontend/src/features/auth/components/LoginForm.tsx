'use client';

import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, loading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-8 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-md shadow-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-white tracking-tight">Acceso B2B</h2>
        <p className="text-zinc-400 text-sm mt-2">Ingresa tus credenciales admin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1 uppercase tracking-wider" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-white placeholder-zinc-500 transition-all"
              placeholder="admin@empresa.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1 uppercase tracking-wider" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-white placeholder-zinc-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Ingresar al Panel
              <LogIn className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
