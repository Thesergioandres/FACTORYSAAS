import mongoose, { type Model } from 'mongoose';

type ProductDocument = {
  tenantId: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const productSchema = new mongoose.Schema<ProductDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    sku: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const ProductModel: Model<ProductDocument> =
  (mongoose.models.Product as Model<ProductDocument>) ||
  mongoose.model('Product', productSchema);
