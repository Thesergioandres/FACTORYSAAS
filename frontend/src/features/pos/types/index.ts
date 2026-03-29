export interface IProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  // Solo visible si el usuario es ADMIN/GOD, backend debe sanitizarlo para SELLER
  averageCost?: number; 
  category: string;
  imageUrl?: string;
}

export interface ICartItem {
  product: IProduct;
  quantity: number;
}

export interface IRegisterSalePayload {
  items: { productId: string; name: string; quantity: number; price: number }[];
  paymentMethod: 'CASH' | 'CREDIT';
}
