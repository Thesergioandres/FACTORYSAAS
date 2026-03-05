import { ProductModel } from '../../../../shared/infrastructure/mongoose/models/ProductModel';
import type { InventoryRepository, CreateProductInput, UpdateProductInput } from '../../application/ports/InventoryRepository';
import type { ProductRecord } from '../../domain/entities/Product';

type ProductDoc = {
  _id: { toString(): string };
  tenantId: string;
  name: string;
  sku?: string;
  category?: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  active: boolean;
  lastCost?: number;
  averageCost?: number;
  totalPurchaseUnits?: number;
  totalPurchaseCost?: number;
  lastRestockedAt?: Date | null;
  restocks?: Array<{
    date: Date;
    supplier?: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  createdAt?: Date;
} | null;

function mapProduct(document: ProductDoc): ProductRecord | null {
  if (!document) {
    return null;
  }

  return {
    id: document._id.toString(),
    tenantId: document.tenantId,
    name: document.name,
    sku: document.sku,
    category: document.category || '',
    description: document.description,
    price: document.price,
    stock: document.stock,
    imageUrl: document.imageUrl || undefined,
    active: document.active,
    lastCost: document.lastCost,
    averageCost: document.averageCost,
    totalPurchaseUnits: document.totalPurchaseUnits,
    totalPurchaseCost: document.totalPurchaseCost,
    lastRestockedAt: document.lastRestockedAt ? document.lastRestockedAt.toISOString() : undefined,
    restocks: document.restocks?.map((item) => ({
      date: item.date.toISOString(),
      supplier: item.supplier || undefined,
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost: item.totalCost
    })),
    createdAt: document.createdAt ? document.createdAt.toISOString() : new Date().toISOString()
  };
}

export class MongoInventoryRepository implements InventoryRepository {
  async list(tenantId: string): Promise<ProductRecord[]> {
    const docs = await ProductModel.find({ tenantId }).lean<ProductDoc[]>();
    return docs.map((doc) => mapProduct(doc) as ProductRecord);
  }

  async listPublic(tenantId: string): Promise<ProductRecord[]> {
    const docs = await ProductModel.find({ tenantId, active: true, stock: { $gt: 0 } })
      .select('tenantId name category price stock imageUrl active')
      .lean<ProductDoc[]>();
    return docs.map((doc) => mapProduct(doc) as ProductRecord);
  }

  async findById(id: string, tenantId: string): Promise<ProductRecord | null> {
    const doc = await ProductModel.findOne({ _id: id, tenantId }).lean<ProductDoc>();
    return mapProduct(doc);
  }

  async create(payload: CreateProductInput): Promise<ProductRecord> {
    const doc = await ProductModel.create({
      tenantId: payload.tenantId,
      name: payload.name,
      sku: payload.sku || '',
      category: payload.category,
      description: payload.description || '',
      price: Number(payload.price),
      stock: Number(payload.stock),
      imageUrl: payload.imageUrl || '',
      active: payload.active ?? true,
      lastCost: 0,
      averageCost: 0,
      totalPurchaseUnits: 0,
      totalPurchaseCost: 0,
      lastRestockedAt: null,
      restocks: []
    });

    return mapProduct(doc.toObject() as typeof doc & { _id: { toString(): string } }) as ProductRecord;
  }

  async update(id: string, payload: UpdateProductInput): Promise<ProductRecord | null> {
    const update: Record<string, unknown> = {};
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.sku !== undefined) update.sku = payload.sku;
    if (payload.category !== undefined) update.category = payload.category;
    if (payload.description !== undefined) update.description = payload.description;
    if (payload.price !== undefined) update.price = Number(payload.price);
    if (payload.stock !== undefined) update.stock = Number(payload.stock);
    if (payload.imageUrl !== undefined) update.imageUrl = payload.imageUrl;
    if (payload.active !== undefined) update.active = payload.active;

    const doc = await ProductModel.findByIdAndUpdate(id, update, { new: true }).lean<ProductDoc>();
    return mapProduct(doc);
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
    ).lean<ProductDoc>();

    return mapProduct(doc);
  }

  async recordRestock(tenantId: string, input: { productId: string; quantity: number; unitCost: number; supplier?: string; arrivedAt?: string; }): Promise<ProductRecord | null> {
    const existing = await ProductModel.findOne({ _id: input.productId, tenantId }).lean<ProductDoc>();
    if (!existing) {
      return null;
    }

    const prevUnits = Number(existing.totalPurchaseUnits || 0);
    const prevCost = Number(existing.totalPurchaseCost || 0);
    const newUnits = prevUnits + Number(input.quantity);
    const restockTotal = Number(input.unitCost) * Number(input.quantity);
    const newCost = prevCost + restockTotal;
    const averageCost = newUnits > 0 ? Number((newCost / newUnits).toFixed(4)) : 0;
    const arrivedAt = input.arrivedAt ? new Date(input.arrivedAt) : new Date();

    const doc = await ProductModel.findOneAndUpdate(
      { _id: input.productId, tenantId },
      {
        $inc: { stock: Math.abs(Number(input.quantity)) },
        $set: {
          lastCost: Number(input.unitCost),
          averageCost,
          totalPurchaseUnits: newUnits,
          totalPurchaseCost: newCost,
          lastRestockedAt: arrivedAt
        },
        $push: {
          restocks: {
            date: arrivedAt,
            supplier: input.supplier || '',
            quantity: Number(input.quantity),
            unitCost: Number(input.unitCost),
            totalCost: restockTotal
          }
        }
      },
      { new: true }
    ).lean<ProductDoc>();

    return mapProduct(doc);
  }
}
