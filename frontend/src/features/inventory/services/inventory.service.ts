import { useSessionStore } from '@/shared/store/useSessionStore';

export interface IInventoryProduct {
  id: string;
  name: string;
  sellerPrice: number;
  purchasePrice: number;
  warehouseStock: number;
  category?: string;
}

export interface ICreateProductPayload {
  name: string;
  sellerPrice: number;
  purchasePrice: number;
  warehouseStock: number;
}

export class InventoryService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  private static getHeaders() {
    const token = useSessionStore.getState().token;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getProducts(): Promise<IInventoryProduct[]> {
    const res = await fetch(`${this.API_URL}/inventory/products`, {
      headers: this.getHeaders()
    });
    
    if (!res.ok) throw new Error('Error cargando el inventario');
    return res.json();
  }

  static async createProduct(payload: ICreateProductPayload): Promise<IInventoryProduct> {
    const res = await fetch(`${this.API_URL}/inventory/products`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al crear producto');
    }
    return res.json();
  }

  static async updateStock(productId: string, quantity: number): Promise<any> {
    const res = await fetch(`${this.API_URL}/inventory/products/${productId}/stock`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ quantity })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar stock');
    }
    return res.json();
  }
}
