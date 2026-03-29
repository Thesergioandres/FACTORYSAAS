'use client';

import React from 'react';
import { IInventoryProduct } from '../services/inventory.service';
import { PackageOpen } from 'lucide-react';

export const InventoryGrid = ({ products, onAddStock }: { products: IInventoryProduct[], onAddStock: (id: string) => void }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-zinc-200 text-zinc-400">
         <PackageOpen className="w-12 h-12 mb-3 opacity-20" />
         <p>No hay productos en el inventario.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500">
              <th className="p-4 font-semibold">Producto</th>
              <th className="p-4 font-semibold">Stock</th>
              <th className="p-4 font-semibold">Costo (CME)</th>
              <th className="p-4 font-semibold">Precio Venta</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                <td className="p-4 font-medium text-zinc-900">{p.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.warehouseStock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {p.warehouseStock} uds
                  </span>
                </td>
                <td className="p-4 text-zinc-600">${p.purchasePrice?.toFixed(2)}</td>
                <td className="p-4 text-zinc-900 font-medium">${p.sellerPrice?.toFixed(2)}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => onAddStock(p.id)}
                    className="text-(--primary) font-medium hover:underline text-xs"
                  >
                    + Ajustar Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
