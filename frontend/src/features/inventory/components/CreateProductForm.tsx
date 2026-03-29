'use client';

import React, { useState } from 'react';
import { ICreateProductPayload } from '../services/inventory.service';
import { Loader2, PlusCircle, X } from 'lucide-react';

export const CreateProductForm = ({ 
  onSubmit, 
  onCancel, 
  loading 
}: { 
  onSubmit: (data: ICreateProductPayload) => void,
  onCancel: () => void,
  loading: boolean 
}) => {
  const [formData, setFormData] = useState<ICreateProductPayload>({
    name: '',
    sellerPrice: 0,
    purchasePrice: 0,
    warehouseStock: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-50 p-4">
       <div className="bg-white w-full max-w-md h-full rounded-l-2xl shadow-2xl p-6 overflow-y-auto flex flex-col slide-in-right">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-zinc-900">Nuevo Producto</h2>
             <button onClick={onCancel} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-500 transition-colors">
                <X className="w-5 h-5"/>
             </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 space-y-5">
             <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Nombre del Producto</label>
                <input 
                   required
                   autoFocus
                   type="text" 
                   value={formData.name}
                   onChange={e => setFormData({ ...formData, name: e.target.value })}
                   className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-(--primary) outline-none transition-shadow"
                   placeholder="Ej. Tinte Premium L'Oreal"
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-semibold text-zinc-700 mb-1" title="Costo Promedio de Adquisición o Producción">Costo (CME)</label>
                   <input required type="number" step="0.01" min="0" value={formData.purchasePrice || ''} onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-(--primary) outline-none" placeholder="0.00" />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-zinc-700 mb-1">Precio Venta Público</label>
                   <input required type="number" step="0.01" min="0" value={formData.sellerPrice || ''} onChange={e => setFormData({ ...formData, sellerPrice: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-(--primary) outline-none" placeholder="0.00" />
                </div>
             </div>

             <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Stock Inicial en Bodega</label>
                <input required type="number" min="0" value={formData.warehouseStock || ''} onChange={e => setFormData({ ...formData, warehouseStock: Number(e.target.value) })}
                   className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-(--primary) outline-none" placeholder="0" />
             </div>

             <div className="mt-8">
               <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-(--primary) text-(--secondary) font-bold uppercase tracking-wider text-sm shadow-md hover:brightness-110 transition-all disabled:opacity-50">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PlusCircle className="w-4 h-4" /> Crear Producto</>}
               </button>
             </div>
          </form>
       </div>
    </div>
  );
};
