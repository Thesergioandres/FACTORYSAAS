import { useSessionStore } from '@/shared/store/useSessionStore';
import { IProduct, IRegisterSalePayload } from '../types';

export class PosService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  private static getHeaders() {
    const token = useSessionStore.getState().token;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getProducts(): Promise<IProduct[]> {
    const res = await fetch(`${this.API_URL}/inventory`, {
      headers: this.getHeaders()
    });
    
    if (!res.ok) throw new Error('Error al cargar productos');
    const data = await res.json();
    return data;
  }

  static async registerSale(payload: IRegisterSalePayload): Promise<any> {
    const res = await fetch(`${this.API_URL}/pos/sales`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...payload,
        // Role is extracted by backend via JWT, or we can send it just in case
        role: useSessionStore.getState().user?.role || 'SELLER'
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Error al procesar la venta');
    }

    return res.json();
  }
}
