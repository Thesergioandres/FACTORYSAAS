import { PlanModel } from '../../../../shared/infrastructure/mongoose/models/PlanModel';
import type { PlansRepository, PlanEntity, CreatePlanInput, UpdatePlanInput } from '../../application/ports/PlansRepository';

function mapPlan(document: {
  _id: { toString(): string };
  name: string;
  price: number;
  maxBranches: number;
  maxBarbers: number;
  maxMonthlyAppointments: number;
  features: string[];
} | null): PlanEntity | null {
  if (!document) return null;

  return {
    id: document._id.toString(),
    name: document.name,
    price: document.price,
    maxBranches: document.maxBranches,
    maxBarbers: document.maxBarbers,
    maxMonthlyAppointments: document.maxMonthlyAppointments,
    features: document.features || []
  };
}

export class MongoPlansRepository implements PlansRepository {
  async findById(id: string) {
    const doc = await PlanModel.findById(id).lean();
    return mapPlan(doc as typeof doc & { _id: { toString(): string } });
  }

  async findByName(name: string) {
    const doc = await PlanModel.findOne({ name }).lean();
    return mapPlan(doc as typeof doc & { _id: { toString(): string } });
  }

  async listAll() {
    const docs = await PlanModel.find().lean();
    return docs
      .map((doc) => mapPlan(doc as typeof doc & { _id: { toString(): string } }))
      .filter(Boolean) as PlanEntity[];
  }

  async create(input: CreatePlanInput) {
    const doc = await PlanModel.create(input);
    return mapPlan(doc.toObject() as typeof doc & { _id: { toString(): string } }) as PlanEntity;
  }

  async update(id: string, input: UpdatePlanInput) {
    const doc = await PlanModel.findByIdAndUpdate(id, input, { new: true }).lean();
    return mapPlan(doc as typeof doc & { _id: { toString(): string } });
  }
}
