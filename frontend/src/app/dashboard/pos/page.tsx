import React from 'react';
import { ProductGrid } from '@/features/pos/components/ProductGrid';
import { CartPanel } from '@/features/pos/components/CartPanel';
import { FadeIn } from '@/shared/ui/FadeIn';

export const metadata = {
  title: 'POS | FACTORY SAAS'
};

export default function PosPage() {
  return (
    <FadeIn className="h-full bg-zinc-50 border-t border-zinc-200">
      <div className="flex w-full h-full">
        {/* Panel Izquierdo: Catálogo */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 bg-white border-b border-zinc-200">
             <h1 className="text-2xl font-bold text-zinc-900">Punto de Venta</h1>
             <p className="text-sm text-zinc-500 mt-1">Selecciona productos para iniciar el checkout</p>
          </div>
          <ProductGrid />
        </div>

        {/* Panel Derecho: Carrito */}
        <div className="w-[380px] shrink-0 bg-white">
          <CartPanel />
        </div>
      </div>
    </FadeIn>
  );
}
