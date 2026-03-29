import type { ProductRecord } from '../../domain/entities/Product';

export type CreateProductInput = {
  tenantId: string;
  name: string;
  sku?: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  active?: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type SaleItemInput = {
  productId: string;
  quantity: number;
};

export type RestockInput = {
  productId: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
  arrivedAt?: string;
};

export interface InventoryRepository {
  list(tenantId: string): Promise<ProductRecord[]>;
  listPublic(tenantId: string): Promise<ProductRecord[]>;
  findById(id: string, tenantId: string): Promise<ProductRecord | null>;
  create(input: CreateProductInput): Promise<ProductRecord>;
  update(id: string, input: UpdateProductInput): Promise<ProductRecord | null>;
  delete(id: string, tenantId: string): Promise<boolean>;
  decrementStock(tenantId: string, id: string, quantity: number, sellerId?: string, options?: { session?: any }): Promise<ProductRecord | null>;
  restoreStock(tenantId: string, id: string, quantity: number, sellerId?: string, options?: { session?: any }): Promise<boolean>;
  recordRestock(tenantId: string, input: RestockInput): Promise<ProductRecord | null>;
  assignToSeller(tenantId: string, sellerId: string, productId: string, quantity: number): Promise<boolean>;
}
