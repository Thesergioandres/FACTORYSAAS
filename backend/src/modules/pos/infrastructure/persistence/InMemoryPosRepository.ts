import { randomUUID } from 'crypto';
import type { CreatePosSaleInput, PosRepository, PosSale } from '../../application/ports/PosRepository';

export class InMemoryPosRepository implements PosRepository {
  private sales: PosSale[] = [];

  async listSales(tenantId: string) {
    return this.sales.filter((sale) => sale.tenantId === tenantId);
  }

  async findById(tenantId: string, id: string) {
    return this.sales.find((sale) => sale.tenantId === tenantId && sale.id === id) || null;
  }

  async createSale(input: CreatePosSaleInput) {
    const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const sale: PosSale = {
      id: randomUUID(),
      tenantId: input.tenantId,
      tableId: input.tableId,
      items: input.items,
      total,
      paymentMethod: input.paymentMethod,
      createdAt: new Date().toISOString()
    };
    this.sales.push(sale);
    return sale;
  }
}
