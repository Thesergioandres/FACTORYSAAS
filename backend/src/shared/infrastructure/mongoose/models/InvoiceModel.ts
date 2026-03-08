import mongoose, { type Model } from 'mongoose';

type InvoiceDocument = {
  tenantId: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
};

const invoiceSchema = new mongoose.Schema<InvoiceDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, required: true },
    country: { type: String, required: true }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

invoiceSchema.index({ tenantId: 1, createdAt: -1 });

export const InvoiceModel: Model<InvoiceDocument> =
  (mongoose.models.Invoice as Model<InvoiceDocument>) ||
  mongoose.model('Invoice', invoiceSchema);
