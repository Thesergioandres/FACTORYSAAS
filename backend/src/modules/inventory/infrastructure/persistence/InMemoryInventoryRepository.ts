import { randomUUID } from 'crypto';
import { database } from '../../../../shared/infrastructure/memory/database';
import type { InventoryRepository, CreateProductInput, UpdateProductInput } from '../../application/ports/InventoryRepository';
import type { ProductRecord } from '../../domain/entities/Product';

export class InMemoryInventoryRepository implements InventoryRepository {
  async list(tenantId: string): Promise<ProductRecord[]> {
    return database.inventory.filter((item) => item.tenantId === tenantId);
  }

  async findById(id: string, tenantId: string): Promise<ProductRecord | null> {
    const item = database.inventory.find((product) => product.id === id && product.tenantId === tenantId);
    return item || null;
  }

  async create(payload: CreateProductInput): Promise<ProductRecord> {
    const product: ProductRecord = {
      id: randomUUID(),
      tenantId: payload.tenantId,
      name: payload.name,
      sku: payload.sku,
      description: payload.description,
      price: Number(payload.price),
      stock: Number(payload.stock),
      active: payload.active ?? true,
      createdAt: new Date().toISOString()
    };

    database.inventory.push(product);
    return product;
  }

  async update(id: string, payload: UpdateProductInput): Promise<ProductRecord | null> {
    const product = database.inventory.find((item) => item.id === id);
    if (!product) {
      return null;
    }

    product.name = payload.name ?? product.name;
    product.sku = payload.sku ?? product.sku;
    product.description = payload.description ?? product.description;
    product.price = payload.price !== undefined ? Number(payload.price) : product.price;
    product.stock = payload.stock !== undefined ? Number(payload.stock) : product.stock;
    if (payload.active !== undefined) {
      product.active = payload.active;
    }

    return product;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const index = database.inventory.findIndex((item) => item.id === id && item.tenantId === tenantId);
    if (index === -1) return false;
    database.inventory.splice(index, 1);
    return true;
  }

  async decrementStock(tenantId: string, id: string, quantity: number): Promise<ProductRecord | null> {
    const product = database.inventory.find((item) => item.id === id && item.tenantId === tenantId);
    if (!product) return null;
    if (product.stock < quantity) return null;

    product.stock -= Math.abs(quantity);
    return product;
  }
}
