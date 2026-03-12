import { randomUUID } from 'crypto';
import type { CreateTableInput, TableRecord, TableStatus, TablesRepository } from '../../application/ports/TablesRepository';

export class InMemoryTablesRepository implements TablesRepository {
  private tables: TableRecord[] = [];

  async list(tenantId: string) {
    return this.tables.filter((table) => table.tenantId === tenantId);
  }

  async create(input: CreateTableInput) {
    const table: TableRecord = {
      id: randomUUID(),
      tenantId: input.tenantId,
      name: input.name,
      capacity: input.capacity,
      status: 'LIBRE',
      updatedAt: new Date().toISOString()
    };
    this.tables.push(table);
    return table;
  }

  async updateStatus(tenantId: string, id: string, status: TableStatus, currentOrderId?: string) {
    const index = this.tables.findIndex((table) => table.tenantId === tenantId && table.id === id);
    if (index < 0) return null;

    let updatedOrderId = currentOrderId !== undefined ? currentOrderId : this.tables[index].currentOrderId;
    if (status === 'LIBRE' || status === 'LIMPIEZA') {
      updatedOrderId = undefined;
    }

    const updated: TableRecord = {
      ...this.tables[index],
      status,
      currentOrderId: updatedOrderId,
      updatedAt: new Date().toISOString()
    };
    this.tables[index] = updated;
    return updated;
  }
}
