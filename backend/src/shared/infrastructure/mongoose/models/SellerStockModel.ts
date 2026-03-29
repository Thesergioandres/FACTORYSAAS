import mongoose, { type Model } from 'mongoose';

type SellerStockDocument = {
  tenantId: string;
  sellerId: string;
  productId: mongoose.Types.ObjectId | string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

const sellerStockSchema = new mongoose.Schema<SellerStockDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    quantity: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

sellerStockSchema.index({ tenantId: 1, sellerId: 1, productId: 1 }, { unique: true });

export const SellerStockModel: Model<SellerStockDocument> =
  (mongoose.models.SellerStock as Model<SellerStockDocument>) ||
  mongoose.model('SellerStock', sellerStockSchema);
