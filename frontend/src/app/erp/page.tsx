'use client';

import Link from 'next/link';
import { useSessionStore } from '@/shared/store/useSessionStore';

export default function ERPLandingPage() {
  const { user } = useSessionStore();
  const isGod = user?.role === 'GOD';
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-6">
        Landing Exclusiva del ERP
      </h1>
      <p className="text-zinc-400 mb-8 max-w-xl">
        Descubre el mejor sistema de planificación de recursos (ERP) para tu negocio retail. 
        Controla inventario, ventas y clientes desde cualquier lugar con nuestra solución en la nube.
      </p>
      
      {isGod ? (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 flex flex-col items-start gap-4 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">MODO GOD</span>
            <p className="text-red-200 font-medium">Las cuentas GOD no pueden contratar servicios.</p>
          </div>
          <Link 
            href="/god-panel" 
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-red-900/20 transition-all"
          >
            Volver al Panel GOD
          </Link>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link 
            href="/erp/login" 
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Acceso Clientes
          </Link>
          <Link 
            href="/erp/register" 
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all"
          >
            Crear mi cuenta gratis
          </Link>
        </div>
      )}
    </div>
  );
}
