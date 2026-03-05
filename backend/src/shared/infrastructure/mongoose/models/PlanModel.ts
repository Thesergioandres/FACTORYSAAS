import mongoose, { type Model } from 'mongoose';

type PlanDocument = {
  name: string;
  price: number;
  maxBranches: number;
  maxStaff: number;
  maxMonthlyAppointments: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
};

const planSchema = new mongoose.Schema<PlanDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true },
    maxBranches: { type: Number, required: true },
    maxStaff: { type: Number, required: true },
    maxMonthlyAppointments: { type: Number, required: true },
    features: { type: [String], default: [] }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const PlanModel: Model<PlanDocument> =
  (mongoose.models.Plan as Model<PlanDocument>) ||
  mongoose.model('Plan', planSchema);
