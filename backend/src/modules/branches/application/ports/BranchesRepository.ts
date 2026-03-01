export type BranchEntity = {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone?: string;
  active: boolean;
  createdAt: string;
};

export type CreateBranchInput = Omit<BranchEntity, 'id' | 'createdAt'>;

export interface BranchesRepository {
  listByTenant(tenantId: string): Promise<BranchEntity[]>;
  countByTenant(tenantId: string): Promise<number>;
  create(input: CreateBranchInput): Promise<BranchEntity>;
}
