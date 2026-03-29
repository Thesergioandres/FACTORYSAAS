import { useState, useEffect } from 'react';
import { IProduct } from '../types';
import { PosService } from '../services/pos.service';

export const useProducts = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await PosService.getProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Error cargando el catálogo de productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return { products, loading, error };
};
