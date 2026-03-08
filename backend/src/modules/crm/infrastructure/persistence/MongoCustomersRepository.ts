import type { Types } from 'mongoose';
import { CustomerModel } from '../../../../shared/infrastructure/mongoose/models/CustomerModel';
import type { CustomersRepository, CreateCustomerInput } from '../../application/ports/CustomersRepository';
import type { CustomerRecord } from '../../domain/entities/Customer';

type CustomerDocument = {
  _id: Types.ObjectId;
  tenantId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  tags?: string[];
  createdAt?: Date;
};

function mapCustomer(document: CustomerDocument | null): CustomerRecord | null {
  if (!document) return null;

  return {
    id: document._id.toString(),
    tenantId: document.tenantId,
    name: document.name,
    email: document.email ?? null,
    phone: document.phone ?? null,
    notes: document.notes ?? null,
    tags: document.tags ?? [],
    createdAt: document.createdAt ? new Date(document.createdAt).toISOString() : new Date().toISOString()
  };
}

export class MongoCustomersRepository implements CustomersRepository {
  async listByTenant(tenantId: string): Promise<CustomerRecord[]> {
    const docs = (await CustomerModel.find({ tenantId }).lean()) as CustomerDocument[];
    return docs.map((doc) => mapCustomer(doc) as CustomerRecord);
  }

  async create(input: CreateCustomerInput): Promise<CustomerRecord> {
    const doc = await CustomerModel.create({
      tenantId: input.tenantId,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      notes: input.notes ?? null,
      tags: input.tags ?? []
    });

    return mapCustomer(doc.toObject() as CustomerDocument) as CustomerRecord;
  }
}
