import { ProductModel } from '../../../../shared/infrastructure/mongoose/models/ProductModel';
import type { InventoryRepository, CreateProductInput, UpdateProductInput } from '../../application/ports/InventoryRepository';
import type { ProductRecord } from '../../domain/entities/Product';

function mapProduct(document: {
  _id: { toString(): string };
  tenantId: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt?: Date;
} | null): ProductRecord | null {
  if (!document) {
    return null;
  }

  return {
    id: document._id.toString(),
    tenantId: document.tenantId,
    name: document.name,
    sku: document.sku,
    description: document.description,
    price: document.price,
    stock: document.stock,
    active: document.active,
    createdAt: document.createdAt ? document.createdAt.toISOString() : new Date().toISOString()
  };
}

export class MongoInventoryRepository implements InventoryRepository {
  async list(tenantId: string): Promise<ProductRecord[]> {
    const docs = await ProductModel.find({ tenantId }).lean();
    return docs.map((doc) => mapProduct(doc as typeof doc & { _id: { toString(): string } }) as ProductRecord);
  }

  async findById(id: string, tenantId: string): Promise<ProductRecord | null> {
    const doc = await ProductModel.findOne({ _id: id, tenantId }).lean();
    return mapProduct(doc as typeof doc & { _id: { toString(): string } });
  }

  async create(payload: CreateProductInput): Promise<ProductRecord> {
    const doc = await ProductModel.create({
      tenantId: payload.tenantId,
      name: payload.name,
      sku: payload.sku || '',
      description: payload.description || '',
      price: Number(payload.price),
      stock: Number(payload.stock),
      active: payload.active ?? true
    });

    return mapProduct(doc.toObject() as typeof doc & { _id: { toString(): string } }) as ProductRecord;
  }

  async update(id: string, payload: UpdateProductInput): Promise<ProductRecord | null> {
    const update: Record<string, unknown> = {};
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.sku !== undefined) update.sku = payload.sku;
    if (payload.description !== undefined) update.description = payload.description;
    if (payload.price !== undefined) update.price = Number(payload.price);
    if (payload.stock !== undefined) update.stock = Number(payload.stock);
    if (payload.active !== undefined) update.active = payload.active;

    const doc = await ProductModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return mapProduct(doc as typeof doc & { _id: { toString(): string } });
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await ProductModel.deleteOne({ _id: id, tenantId });
    return result.deletedCount === 1;
  }

  async decrementStock(tenantId: string, id: string, quantity: number): Promise<ProductRecord | null> {
    const doc = await ProductModel.findOneAndUpdate(
      { _id: id, tenantId, stock: { $gte: quantity } },
      { $inc: { stock: -Math.abs(quantity) } },
      { new: true }
    ).lean();

    return mapProduct(doc as typeof doc & { _id: { toString(): string } });
  }
}
