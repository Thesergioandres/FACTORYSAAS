import { useState, useCallback, useEffect } from 'react';
import { InventoryService, IInventoryProduct, ICreateProductPayload } from '../services/inventory.service';

export const useInventory = () => {
  const [products, setProducts] = useState<IInventoryProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products initially
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await InventoryService.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const createProduct = async (payload: ICreateProductPayload): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await InventoryService.createProduct(payload);
      // Actualiza la lista local instantáneamente
      setProducts((prev) => [...prev, newProduct]);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, quantity: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await InventoryService.updateStock(productId, quantity);
      
      // Actualizar estado local
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, warehouseStock: p.warehouseStock + quantity } : p
      ));
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el stock');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { products, loading, error, createProduct, updateStock, refetch: loadProducts };
};
