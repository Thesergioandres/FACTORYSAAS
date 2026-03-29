export type ProductRecord = {
  id: string;
  tenantId: string;
  name: string;
  sku?: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  warehouseStock?: number;
  imageUrl?: string;
  active: boolean;
  lastCost?: number;
  averageCost?: number;
  totalPurchaseUnits?: number;
  totalPurchaseCost?: number;
  lastRestockedAt?: string;
  restocks?: Array<{
    date: string;
    supplier?: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  createdAt: string;
};
