import { TenantModel } from '../../../../shared/infrastructure/mongoose/models/TenantModel';
import { PlanModel } from '../../../../shared/infrastructure/mongoose/models/PlanModel';
import type { TenantsRepository, TenantEntity, CreateTenantInput, UpdateTenantInput } from '../../application/ports/TenantsRepository';

function mapTenant(document: {
  _id: { toString(): string };
  name: string;
  slug: string;
  subdomain: string;
  planId: string;
  status: string;
  customColors?: { primary?: string; secondary?: string };
  logoUrl?: string | null;
  config: TenantEntity['config'];
} | null, planName?: string): TenantEntity | null {
  if (!document) return null;

  return {
    id: document._id.toString(),
    name: document.name,
    slug: document.slug,
    subdomain: document.subdomain,
    planId: document.planId,
    planName,
    status: document.status,
    customColors: document.customColors,
    logoUrl: document.logoUrl ?? null,
    config: document.config
  };
}

export class MongoTenantsRepository implements TenantsRepository {
  async findById(id: string) {
    const doc = await TenantModel.findById(id).lean();
    if (!doc) return null;
    const plan = await PlanModel.findById(doc.planId).lean();
    return mapTenant(doc as typeof doc & { _id: { toString(): string } }, plan?.name);
  }

  async findBySlug(slug: string) {
    const doc = await TenantModel.findOne({ $or: [{ slug }, { subdomain: slug }] }).lean();
    if (!doc) return null;
    const plan = await PlanModel.findById(doc.planId).lean();
    return mapTenant(doc as typeof doc & { _id: { toString(): string } }, plan?.name);
  }

  async listAll() {
    const docs = await TenantModel.find().lean();
    const planIds = Array.from(new Set(docs.map((doc) => doc.planId)));
    const plans = await PlanModel.find({ _id: { $in: planIds } }).lean();
    const planMap = new Map(plans.map((plan) => [plan._id.toString(), plan.name]));

    return docs
      .map((doc) => mapTenant(doc as typeof doc & { _id: { toString(): string } }, planMap.get(doc.planId)))
      .filter(Boolean) as TenantEntity[];
  }

  async create(input: CreateTenantInput) {
    const doc = await TenantModel.create(input);
    const plan = await PlanModel.findById(doc.planId).lean();
    return mapTenant(doc.toObject() as typeof doc & { _id: { toString(): string } }, plan?.name) as TenantEntity;
  }

  async update(id: string, input: UpdateTenantInput) {
    const doc = await TenantModel.findByIdAndUpdate(id, input, { new: true }).lean();
    if (!doc) return null;
    const plan = await PlanModel.findById(doc.planId).lean();
    return mapTenant(doc as typeof doc & { _id: { toString(): string } }, plan?.name);
  }
}
