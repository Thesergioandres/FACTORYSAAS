import mongoose, { type Model } from 'mongoose';

type ProductDocument = {
  tenantId: string;
  name: string;
  sku?: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  active: boolean;
  lastCost?: number;
  averageCost?: number;
  totalPurchaseUnits?: number;
  totalPurchaseCost?: number;
  lastRestockedAt?: Date | null;
  restocks?: Array<{
    date: Date;
    supplier?: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

const productSchema = new mongoose.Schema<ProductDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    sku: { type: String, default: '' },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
    active: { type: Boolean, default: true },
    lastCost: { type: Number, default: 0 },
    averageCost: { type: Number, default: 0 },
    totalPurchaseUnits: { type: Number, default: 0 },
    totalPurchaseCost: { type: Number, default: 0 },
    lastRestockedAt: { type: Date, default: null },
    restocks: {
      type: [
        {
          date: { type: Date, required: true },
          supplier: { type: String, default: '' },
          quantity: { type: Number, required: true },
          unitCost: { type: Number, required: true },
          totalCost: { type: Number, required: true }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

productSchema.index({ tenantId: 1, active: 1 });

export const ProductModel: Model<ProductDocument> =
  (mongoose.models.Product as Model<ProductDocument>) ||
  mongoose.model('Product', productSchema);
