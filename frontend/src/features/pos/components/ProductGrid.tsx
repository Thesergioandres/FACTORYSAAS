'use client';

import React, { useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import { IProduct } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/useCartStore';
import gsap from 'gsap';

export const ProductGrid = () => {
  const { products, loading, error } = useProducts();
  const addItem = useCartStore(state => state.addItem);

  if (loading) return <div className="p-8 text-center text-zinc-500">Cargando catálogo...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={() => addItem(product)} />
      ))}
      
      {/* Mock product si no hay backen levantado */}
      {products.length === 0 && (
         <ProductCard 
            product={{id: 'mock-1', name: 'Premium Haircut', price: 25.0, category: 'Service', stock: 999}} 
            onAdd={() => addItem({id: 'mock-1', name: 'Premium Haircut', price: 25.0, category: 'Service', stock: 999})} 
         />
      )}
    </div>
  );
};

const ProductCard = ({ product, onAdd }: { product: IProduct, onAdd: () => void }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleAdd = () => {
    // Micro-animación de feedback visual GSAP
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { scale: 0.95 },
        { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
    onAdd();
  };

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-xl shadow-sm border border-zinc-100 p-4 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleAdd}
    >
      <div>
        <div className="w-full h-32 bg-zinc-100 rounded-lg mb-3 flex items-center justify-center text-zinc-300">
           {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full rounded-lg" /> : 'Sin Img'}
        </div>
        <h3 className="font-medium text-zinc-800 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-zinc-500 mt-1">{product.category}</p>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="font-semibold text-lg text-zinc-900">${product.price.toFixed(2)}</span>
        <button 
          className="p-2 rounded-full bg-(--primary) text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
