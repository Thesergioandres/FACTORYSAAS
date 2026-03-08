import type { Invoice } from '../../domain/entities/Invoice';

export type CreateInvoiceInput = Omit<Invoice, 'id' | 'createdAt'>;

export interface InvoicesRepository {
  create(input: CreateInvoiceInput): Promise<Invoice>;
  listByTenant(tenantId: string): Promise<Invoice[]>;
}
