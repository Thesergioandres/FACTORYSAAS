export type PosSaleItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type PosSale = {
  id: string;
  tenantId: string;
  tableId?: string;
  items: PosSaleItem[];
  total: number;
  paymentMethod?: string;
  createdAt: string;
};

export type CreatePosSaleInput = {
  tenantId: string;
  sellerId?: string;
  tableId?: string;
  items: PosSaleItem[];
  paymentMethod?: string;
  paymentStatus?: 'confirmado' | 'pendiente';
};

export interface PosRepository {
  listSales(tenantId: string): Promise<PosSale[]>;
  findById(tenantId: string, id: string): Promise<PosSale | null>;
  createSale(input: CreatePosSaleInput, options?: { session?: any }): Promise<PosSale>;
}
