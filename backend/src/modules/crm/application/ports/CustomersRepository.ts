import type { CustomerRecord } from '../../domain/entities/Customer';

export type CreateCustomerInput = {
  tenantId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  tags?: string[];
};

export interface CustomersRepository {
  listByTenant(tenantId: string): Promise<CustomerRecord[]>;
  create(input: CreateCustomerInput): Promise<CustomerRecord>;
}
