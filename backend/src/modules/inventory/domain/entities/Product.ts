export type ProductRecord = {
  id: string;
  tenantId: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string;
};
