import type { ProductRecord } from '../../domain/entities/Product';

export type CreateProductInput = {
  tenantId: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  active?: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type SaleItemInput = {
  productId: string;
  quantity: number;
};

export interface InventoryRepository {
  list(tenantId: string): Promise<ProductRecord[]>;
  findById(id: string, tenantId: string): Promise<ProductRecord | null>;
  create(input: CreateProductInput): Promise<ProductRecord>;
  update(id: string, input: UpdateProductInput): Promise<ProductRecord | null>;
  delete(id: string, tenantId: string): Promise<boolean>;
  decrementStock(tenantId: string, id: string, quantity: number): Promise<ProductRecord | null>;
}
