import type { Types } from 'mongoose';
import { InvoiceModel } from '../../../../shared/infrastructure/mongoose/models/InvoiceModel';
import type { InvoicesRepository, CreateInvoiceInput } from '../../application/ports/InvoicesRepository';
import type { Invoice } from '../../domain/entities/Invoice';

type InvoiceDocument = {
  _id: Types.ObjectId;
  tenantId: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  country: string;
  createdAt?: Date;
};

export class MongoInvoicesRepository implements InvoicesRepository {
  private mapInvoice(document: InvoiceDocument | null): Invoice | null {
    if (!document) return null;
    return {
      id: document._id.toString(),
      tenantId: document.tenantId,
      subtotal: document.subtotal,
      taxAmount: document.taxAmount,
      total: document.total,
      currency: document.currency,
      country: document.country,
      createdAt: document.createdAt ? new Date(document.createdAt).toISOString() : new Date().toISOString()
    };
  }

  async create(input: CreateInvoiceInput): Promise<Invoice> {
    const doc = await InvoiceModel.create(input);
    return this.mapInvoice(doc.toObject() as InvoiceDocument) as Invoice;
  }

  async listByTenant(tenantId: string): Promise<Invoice[]> {
    const docs = (await InvoiceModel.find({ tenantId }).lean()) as InvoiceDocument[];
    return docs.map((doc) => this.mapInvoice(doc) as Invoice);
  }
}
