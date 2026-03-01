import { BranchModel } from '../../../../shared/infrastructure/mongoose/models/BranchModel';
import type { BranchesRepository, BranchEntity, CreateBranchInput } from '../../application/ports/BranchesRepository';

function mapBranch(document: {
  _id: { toString(): string };
  tenantId: string;
  name: string;
  address: string;
  phone?: string;
  active: boolean;
  createdAt?: Date | string;
}): BranchEntity {
  return {
    id: document._id.toString(),
    tenantId: document.tenantId,
    name: document.name,
    address: document.address,
    phone: document.phone,
    active: document.active,
    createdAt: document.createdAt instanceof Date ? document.createdAt.toISOString() : String(document.createdAt)
  };
}

export class MongoBranchesRepository implements BranchesRepository {
  async listByTenant(tenantId: string) {
    const docs = await BranchModel.find({ tenantId }).lean();
    return docs.map((doc) => mapBranch(doc as typeof doc & { _id: { toString(): string } }));
  }

  async countByTenant(tenantId: string) {
    return BranchModel.countDocuments({ tenantId });
  }

  async create(input: CreateBranchInput) {
    const doc = await BranchModel.create(input);
    return mapBranch(doc.toObject() as typeof doc & { _id: { toString(): string } });
  }
}
