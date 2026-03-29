import { SaleModel } from '../../../../shared/infrastructure/mongoose/models/SaleModel';
import type { CreatePosSaleInput, PosRepository, PosSale } from '../../application/ports/PosRepository';

export class MongoPosRepository implements PosRepository {
  async listSales(tenantId: string): Promise<PosSale[]> {
    const docs = await SaleModel.find({ tenantId }).lean();
    return docs.map(doc => ({
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      tableId: doc.tableId,
      items: doc.items,
      total: doc.total,
      paymentMethod: doc.paymentMethod,
      createdAt: doc.createdAt.toISOString()
    })) as PosSale[];
  }

  async findById(tenantId: string, id: string): Promise<PosSale | null> {
    const doc = await SaleModel.findOne({ _id: id, tenantId }).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      tableId: doc.tableId,
      items: doc.items,
      total: doc.total,
      paymentMethod: doc.paymentMethod,
      createdAt: doc.createdAt.toISOString()
    } as PosSale;
  }

  async createSale(input: CreatePosSaleInput, options?: { session?: any }): Promise<PosSale> {
    const total = input.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const salePayload = {
      tenantId: input.tenantId,
      sellerId: input.sellerId,
      tableId: input.tableId,
      items: input.items,
      total,
      paymentMethod: input.paymentMethod || 'CASH',
      paymentStatus: input.paymentStatus || 'confirmado',
      netProfit: 0 // Financial service integration is generally handled upstairs in Use Cases
    };

    const docArray = await SaleModel.create([salePayload], options?.session ? { session: options.session } : undefined);
    const doc = docArray[0];

    return {
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      tableId: doc.tableId,
      items: doc.items,
      total: doc.total,
      paymentMethod: doc.paymentMethod,
      createdAt: doc.createdAt.toISOString()
    } as PosSale;
  }
}
