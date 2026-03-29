import mongoose, { type Model } from 'mongoose';

type UserDocument = {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'ADMIN' | 'STAFF' | 'SELLER' | 'CLIENT' | 'GOD';
  active: boolean;
  whatsappConsent: boolean;
  approved: boolean;
  commissionRate?: number;
  resetTokenHash?: string | null;
  resetTokenExpiresAt?: Date | null;
  tenantId?: string | null;
  branchIds?: string[];
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['GOD', 'ADMIN', 'STAFF', 'SELLER', 'CLIENT'], required: true, index: true },
    active: { type: Boolean, default: true },
    whatsappConsent: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 0.3 },
    resetTokenHash: { type: String, default: null },
    resetTokenExpiresAt: { type: Date, default: null },
    tenantId: { type: String, default: null, index: true },
    branchIds: { type: [String], default: [] }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const UserModel: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) || mongoose.model('User', userSchema);
