import { TenantModel } from '../../../../shared/infrastructure/mongoose/models/TenantModel';
import { PlanModel } from '../../../../shared/infrastructure/mongoose/models/PlanModel';
import type { TenantsRepository, TenantEntity, CreateTenantInput, UpdateTenantInput } from '../../application/ports/TenantsRepository';

function mapTenant(document: {
  _id: { toString(): string };
  name: string;
  slug: string;
  subdomain: string;
  verticalSlug: string;
  activeModules: string[];
  legalConsent?: {
    acceptedAt?: Date;
    termsVersion?: string;
    privacyVersion?: string;
    dataTreatmentVersion?: string;
    cookiesVersion?: string;
    dpaVersion?: string;
    saasVersion?: string;
  };
  businessHours?: Array<{ day: number; openTime: string; closeTime: string; isOpen: boolean }>;
  planId: string;
  status: string;
  validUntil?: Date | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  customColors?: { primary?: string; secondary?: string };
  logoUrl?: string | null;
  config: TenantEntity['config'];
  createdAt?: Date;
} | null, planName?: string): TenantEntity | null {
  if (!document) return null;

  return {
    id: document._id.toString(),
    name: document.name,
    slug: document.slug,
    subdomain: document.subdomain,
    verticalSlug: document.verticalSlug,
    activeModules: document.activeModules || [],
    legalConsent: document.legalConsent
      ? {
          acceptedAt: document.legalConsent.acceptedAt
            ? new Date(document.legalConsent.acceptedAt).toISOString()
            : undefined,
          termsVersion: document.legalConsent.termsVersion,
          privacyVersion: document.legalConsent.privacyVersion,
          dataTreatmentVersion: document.legalConsent.dataTreatmentVersion,
          cookiesVersion: document.legalConsent.cookiesVersion,
          dpaVersion: document.legalConsent.dpaVersion,
          saasVersion: document.legalConsent.saasVersion
        }
      : undefined,
    businessHours: document.businessHours,
    planId: document.planId,
    planName,
    status: document.status,
    validUntil: document.validUntil ? new Date(document.validUntil).toISOString() : null,
    email: document.email ?? null,
    phone: document.phone ?? null,
    country: document.country ?? undefined,
    customColors: document.customColors,
    logoUrl: document.logoUrl ?? null,
    config: document.config,
    createdAt: document.createdAt ? new Date(document.createdAt).toISOString() : undefined
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
