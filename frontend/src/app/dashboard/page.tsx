'use client';

import React, { useEffect, useState } from 'react';
import { useSessionStore } from '@/shared/store/useSessionStore';
import { FadeIn } from '@/shared/ui/FadeIn';
import { DollarSign, Percent, TrendingUp, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const getRole = useSessionStore(state => state.getRole);
  const role = getRole();

  useEffect(() => {
    setMounted(true);
    if (!role) {
      router.replace('/admin-login');
    }
  }, [role, router]);

  if (!mounted || !role) return null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
           <p className="text-zinc-500 mt-1">
             Resumen financiero y métricas de desempeño
           </p>
        </div>
        <button 
           onClick={() => router.push('/dashboard/pos')}
           className="px-6 py-2.5 bg-(--primary) text-(--secondary) font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm"
        >
           Abrir POS
        </button>
      </div>

      <FadeIn duration={0.6}>
        {role === 'SELLER' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Mis Ventas de Hoy"
              value="8"
               icon={<Package className="text-blue-500" />}
            />
            <MetricCard 
              title="Mis Comisiones (Estimado)"
              value="$125.50"
               icon={<Percent className="text-amber-500" />}
               sub="Mostrando solo la retribución al trabajador"
            />
          </div>
        ) : (
          <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                  title="Ingreso Bruto"
                  value="$8,250.00"
                  icon={<DollarSign className="text-emerald-500" />}
                  trend="+15%"
                  bgClass="border-emerald-100 bg-emerald-50/30"
                />
                <MetricCard 
                  title="Utilidad Neta (Net Profit)"
                  value="$3,410.25"
                  icon={<TrendingUp className="text-(--primary)" />}
                  trend="+22%"
                  sub="Descontando comisiones de SELLER"
                />
                <MetricCard 
                  title="Total Transacciones"
                  value="142"
                  icon={<Package className="text-blue-500" />}
                />
             </div>
             {/* Gráficas / Charts (Mockups for now) */}
             <div className="w-full h-64 border border-zinc-200 rounded-xl bg-white flex items-center justify-center">
                 <p className="text-zinc-400 font-medium">Área reservada para Chart.js / Recharts</p>
             </div>
          </div>
        )}
      </FadeIn>
    </div>
  );
}

const MetricCard = ({ title, value, icon, trend, sub, bgClass = 'bg-white border-zinc-200' }: { title: string, value: string, icon: React.ReactNode, trend?: string, sub?: string, bgClass?: string }) => (
  <div className={`p-6 rounded-2xl border flex flex-col justify-between ${bgClass} shadow-sm transition-transform hover:-translate-y-1`}>
     <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">{title}</h3>
        <div className="p-2 rounded-lg bg-white/60 shadow-sm border border-black/5">
           {icon}
        </div>
     </div>
     <div>
       <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">{value}</span>
       {trend && <span className="ml-3 text-sm font-medium text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">{trend}</span>}
     </div>
     {sub && <p className="text-xs text-zinc-400 mt-2">{sub}</p>}
  </div>
);
