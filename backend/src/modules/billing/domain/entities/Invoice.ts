export type Invoice = {
  id: string;
  tenantId: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  country: string;
  createdAt: string;
};
