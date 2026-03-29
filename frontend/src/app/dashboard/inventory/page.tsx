'use client';

import React, { useEffect, useState } from 'react';
import { useSessionStore } from '@/shared/store/useSessionStore';
import { useRouter } from 'next/navigation';
import { FadeIn } from '@/shared/ui/FadeIn';
import { useInventory } from '@/features/inventory/hooks/useInventory';
import { InventoryGrid } from '@/features/inventory/components/InventoryGrid';
import { CreateProductForm } from '@/features/inventory/components/CreateProductForm';
import { Plus, PackageSearch, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const router = useRouter();
  const getRole = useSessionStore(state => state.getRole);
  const role = getRole();
  const [mounted, setMounted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { products, loading, error, createProduct } = useInventory();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // RBAC: Solo ADMIN / GOD pueden ver el inventario central
  if (role === 'SELLER') {
    return (
      <FadeIn className="flex flex-col items-center justify-center h-full p-8 text-center bg-zinc-50">
         <AlertTriangle className="w-16 h-16 text-red-500 mb-4 opacity-80" />
         <h1 className="text-2xl font-bold text-zinc-900 mb-2">Acceso Restringido</h1>
         <p className="text-zinc-500 max-w-md">
            Tu rol de SELLER no te permite acceder a la gestión del inventario general. Por favor, dirige cualquier requerimiento a tu administrador.
         </p>
         <button onClick={() => router.push('/dashboard/pos')} className="mt-8 px-6 py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800">
            Ir al Punto de Venta
         </button>
      </FadeIn>
    );
  }

  const handleCreate = async (payload: any) => {
    const success = await createProduct(payload);
    if (success) {
       setIsCreating(false);
    }
  };

  return (
    <FadeIn className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-zinc-900">Inventario y Catálogo</h1>
           <p className="text-zinc-500 mt-1">Gestión de bodegas, precios y costos unitarios.</p>
        </div>
        <button 
           onClick={() => setIsCreating(true)}
           className="flex items-center gap-2 px-5 py-2.5 bg-(--primary) text-(--secondary) font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:brightness-110 transition-all"
        >
           <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      {error && (
         <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl max-w-2xl flex gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
         </div>
      )}

      {loading && products.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
            <PackageSearch className="w-12 h-12 mb-4 animate-pulse opacity-20" />
            <p className="font-medium animate-pulse">Sincronizando maestro de artículos...</p>
         </div>
      ) : (
         <div className="flex-1 overflow-y-auto">
            <InventoryGrid products={products} onAddStock={(id) => console.log('Ajustar', id)} />
         </div>
      )}

      {isCreating && (
         <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Modal Overlay / Form */}
            <CreateProductForm 
               loading={loading}
               onSubmit={handleCreate} 
               onCancel={() => setIsCreating(false)} 
            />
         </div>
      )}
    </FadeIn>
  );
}
