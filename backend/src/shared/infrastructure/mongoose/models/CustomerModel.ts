import mongoose, { type Model } from 'mongoose';

type CustomerDocument = {
  tenantId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
};

const customerSchema = new mongoose.Schema<CustomerDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    notes: { type: String, default: null },
    tags: { type: [String], default: [] }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

customerSchema.index({ tenantId: 1, email: 1 });

export const CustomerModel: Model<CustomerDocument> =
  (mongoose.models.Customer as Model<CustomerDocument>) ||
  mongoose.model('Customer', customerSchema);
