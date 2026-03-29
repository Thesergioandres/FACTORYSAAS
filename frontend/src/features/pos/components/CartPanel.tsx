'use client';

import React from 'react';
import { useCartStore } from '../store/useCartStore';
import { useCheckout } from '../hooks/useCheckout';
import { Trash2, Loader2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';

export const CartPanel = () => {
  const { items, paymentMethod, setPaymentMethod, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const { checkout, loading, error } = useCheckout();

  const handleCheckout = async () => {
    const success = await checkout();
    if (success) {
      alert('¡Venta registrada con éxito!');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white border-l border-zinc-200">
      <div className="p-4 border-b border-zinc-100 flex-none bg-(--primary) text-(--secondary)">
        <h2 className="text-lg font-semibold flex items-center justify-between">
          Orden Actual
          <span className="text-sm font-normal opacity-80 backdrop-blur-md bg-black/10 px-2 py-1 rounded">
             {items.reduce((acc, curr) => acc + curr.quantity, 0)} Items
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400">
            <ShoppingCartIcon className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm text-center">Selecciona productos<br/>para comenzar la venta</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="flex flex-col bg-zinc-50 rounded-lg p-3 border border-zinc-100 relative group">
              <div className="flex justify-between items-start mb-2 pr-6">
                <span className="font-medium text-sm text-zinc-800 line-clamp-2">{item.product.name}</span>
                <span className="font-semibold text-zinc-900 whitespace-nowrap ml-2">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-white rounded-md border border-zinc-200 p-1">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 hover:bg-zinc-100 rounded text-zinc-600"><Minus className="w-3 h-3" /></button>
                  <span className="text-xs font-semibold w-6 text-center text-zinc-800">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 hover:bg-zinc-100 rounded text-zinc-600"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
              <button 
                onClick={() => removeItem(item.product.id)}
                className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                 <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex-none p-4 bg-zinc-50 border-t border-zinc-200 space-y-4">
        {/* Payment Method Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setPaymentMethod('CASH')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors border ${paymentMethod === 'CASH' ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'}`}
          >
            <Banknote className="w-4 h-4" /> CASH
          </button>
          <button
            onClick={() => setPaymentMethod('CREDIT')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors border ${paymentMethod === 'CREDIT' ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'}`}
          >
            <CreditCard className="w-4 h-4" /> CREDIT
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex justify-between items-end pt-2">
           <span className="text-zinc-500 font-medium">Subtotal</span>
           <span className="text-2xl font-bold text-zinc-900">${getSubtotal().toFixed(2)}</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading || items.length === 0}
          className="w-full flex justify-center items-center py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all text-(--secondary) bg-(--primary) hover:brightness-110 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cobrar Orden'}
        </button>
      </div>
    </div>
  );
};

const ShoppingCartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);
