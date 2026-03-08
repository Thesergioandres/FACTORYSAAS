import type { Types } from 'mongoose';
import { TableModel, type TableDocument } from '../../../../shared/infrastructure/mongoose/models/TableModel';
import type { CreateTableInput, TableRecord, TableStatus, TablesRepository } from '../../application/ports/TablesRepository';

export class MongoTablesRepository implements TablesRepository {
  private mapTable(document: (TableDocument & { _id: Types.ObjectId }) | null): TableRecord | null {
    if (!document) return null;
    return {
      id: document._id.toString(),
      tenantId: document.tenantId,
      name: document.name,
      capacity: document.capacity,
      status: document.status,
      updatedAt: document.updatedAt?.toISOString() || new Date().toISOString()
    };
  }

  async list(tenantId: string): Promise<TableRecord[]> {
    const docs = (await TableModel.find({ tenantId }).lean()) as Array<TableDocument & { _id: Types.ObjectId }>;
    return docs.map((doc) => this.mapTable(doc) as TableRecord);
  }

  async create(input: CreateTableInput): Promise<TableRecord> {
    const doc = await TableModel.create({
      tenantId: input.tenantId,
      name: input.name,
      capacity: input.capacity,
      status: 'LIBRE'
    });
    return this.mapTable(doc.toObject() as TableDocument & { _id: Types.ObjectId }) as TableRecord;
  }

  async updateStatus(tenantId: string, id: string, status: TableStatus): Promise<TableRecord | null> {
    const doc = await TableModel.findOneAndUpdate(
      { tenantId, _id: id },
      { status },
      { new: true }
    ).lean();
    return this.mapTable(doc as (TableDocument & { _id: Types.ObjectId }) | null);
  }
}
