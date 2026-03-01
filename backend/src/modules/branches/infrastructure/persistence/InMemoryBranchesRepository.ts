import { randomUUID } from 'crypto';
import { database } from '../../../../shared/infrastructure/memory/database';
import type { BranchesRepository, BranchEntity, CreateBranchInput } from '../../application/ports/BranchesRepository';

function mapBranch(branch: BranchEntity): BranchEntity {
  return { ...branch };
}

export class InMemoryBranchesRepository implements BranchesRepository {
  async listByTenant(tenantId: string) {
    return database.branches.filter((branch) => branch.tenantId === tenantId).map(mapBranch);
  }

  async countByTenant(tenantId: string) {
    return database.branches.filter((branch) => branch.tenantId === tenantId).length;
  }

  async create(input: CreateBranchInput) {
    const branch: BranchEntity = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input
    };
    database.branches.push(branch);
    return mapBranch(branch);
  }
}
