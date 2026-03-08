import { randomUUID } from 'crypto';
import { database } from '../../../../shared/infrastructure/memory/database';
import type { CustomersRepository, CreateCustomerInput } from '../../application/ports/CustomersRepository';
import type { CustomerRecord } from '../../domain/entities/Customer';

export class InMemoryCustomersRepository implements CustomersRepository {
  async listByTenant(tenantId: string): Promise<CustomerRecord[]> {
    return database.customers.filter((customer) => customer.tenantId === tenantId);
  }

  async create(input: CreateCustomerInput): Promise<CustomerRecord> {
    const record: CustomerRecord = {
      id: randomUUID(),
      tenantId: input.tenantId,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      notes: input.notes ?? null,
      tags: input.tags ?? [],
      createdAt: new Date().toISOString()
    };

    database.customers.push(record);
    return record;
  }
}
