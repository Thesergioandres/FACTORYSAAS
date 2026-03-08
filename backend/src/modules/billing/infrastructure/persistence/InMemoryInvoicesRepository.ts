import { randomUUID } from 'crypto';
import type { InvoicesRepository, CreateInvoiceInput } from '../../application/ports/InvoicesRepository';
import type { Invoice } from '../../domain/entities/Invoice';
import { database } from '../../../../shared/infrastructure/memory/database';

export class InMemoryInvoicesRepository implements InvoicesRepository {
  async create(input: CreateInvoiceInput): Promise<Invoice> {
    const invoice: Invoice = {
      id: randomUUID(),
      ...input,
      createdAt: new Date().toISOString()
    };
    database.invoices.push(invoice);
    return invoice;
  }

  async listByTenant(tenantId: string): Promise<Invoice[]> {
    return database.invoices.filter((invoice) => invoice.tenantId === tenantId);
  }
}
