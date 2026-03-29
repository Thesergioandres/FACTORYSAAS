import mongoose, { type Model } from 'mongoose';

type SaleDocument = {
  tenantId: string;
  sellerId?: string;
  tableId?: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    costBasis: number;
  }>;
  total: number;
  paymentMethod?: string;
  paymentStatus: 'confirmado' | 'pendiente';
  netProfit: number;
  createdAt: Date;
  updatedAt: Date;
};

const saleSchema = new mongoose.Schema<SaleDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    sellerId: { type: String, index: true },
    tableId: { type: String, index: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        costBasis: { type: Number, default: 0 }
      }
    ],
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: 'CASH' },
    paymentStatus: { type: String, enum: ['confirmado', 'pendiente'], default: 'confirmado' },
    netProfit: { type: Number, default: 0 }
  },
  { timestamps: true }
);

saleSchema.index({ tenantId: 1, paymentStatus: 1 });
saleSchema.index({ tenantId: 1, sellerId: 1 });

export const SaleModel: Model<SaleDocument> =
  (mongoose.models.Sale as Model<SaleDocument>) ||
  mongoose.model('Sale', saleSchema);
