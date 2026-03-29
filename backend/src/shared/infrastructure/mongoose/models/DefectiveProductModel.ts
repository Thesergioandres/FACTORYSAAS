import mongoose, { type Model } from 'mongoose';

type DefectiveProductDocument = {
  tenantId: string;
  sellerId?: string;
  productId: mongoose.Types.ObjectId | string;
  quantity: number;
  lossValue: number;
  reason: string;
  hasWarranty: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const defectiveProductSchema = new mongoose.Schema<DefectiveProductDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    sellerId: { type: String, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    quantity: { type: Number, required: true, default: 1 },
    lossValue: { type: Number, required: true },
    reason: { type: String, required: true },
    hasWarranty: { type: Boolean, default: false }
  },
  { timestamps: true }
);

defectiveProductSchema.index({ tenantId: 1, productId: 1 });

export const DefectiveProductModel: Model<DefectiveProductDocument> =
  (mongoose.models.DefectiveProduct as Model<DefectiveProductDocument>) ||
  mongoose.model('DefectiveProduct', defectiveProductSchema);
