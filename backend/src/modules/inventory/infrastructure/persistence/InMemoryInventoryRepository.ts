import { randomUUID } from 'crypto';
import { database } from '../../../../shared/infrastructure/memory/database';
import type { InventoryRepository, CreateProductInput, UpdateProductInput } from '../../application/ports/InventoryRepository';
import type { ProductRecord } from '../../domain/entities/Product';

export class InMemoryInventoryRepository implements InventoryRepository {
  async list(tenantId: string): Promise<ProductRecord[]> {
    return database.inventory.filter((item) => item.tenantId === tenantId);
  }

  async listPublic(tenantId: string): Promise<ProductRecord[]> {
    return database.inventory.filter((item) => item.tenantId === tenantId && item.active && item.stock > 0);
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
      category: payload.category,
      description: payload.description,
      price: Number(payload.price),
      stock: Number(payload.stock),
      imageUrl: payload.imageUrl,
      active: payload.active ?? true,
      lastCost: 0,
      averageCost: 0,
      totalPurchaseUnits: 0,
      totalPurchaseCost: 0,
      lastRestockedAt: undefined,
      restocks: [],
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
    product.category = payload.category ?? product.category;
    product.description = payload.description ?? product.description;
    product.price = payload.price !== undefined ? Number(payload.price) : product.price;
    product.stock = payload.stock !== undefined ? Number(payload.stock) : product.stock;
    product.imageUrl = payload.imageUrl ?? product.imageUrl;
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

  async decrementStock(tenantId: string, id: string, quantity: number, sellerId?: string, options?: { session?: any }): Promise<ProductRecord | null> {
    const product = database.inventory.find((item) => item.id === id && item.tenantId === tenantId);
    if (!product) return null;
    if (sellerId) {
       // Mock for seller stock in memory
       return product;
    }
    if (product.stock < quantity) return null;

    product.stock -= Math.abs(quantity);
    product.warehouseStock = (product.warehouseStock || 0) - Math.abs(quantity);
    return product;
  }

  async restoreStock(tenantId: string, id: string, quantity: number, sellerId?: string, options?: { session?: any }): Promise<boolean> {
    const product = database.inventory.find((item) => item.id === id && item.tenantId === tenantId);
    if (!product) return false;

    if (!sellerId) {
      product.warehouseStock = (product.warehouseStock || 0) + Math.abs(quantity);
    }
    return true;
  }

  async assignToSeller(tenantId: string, sellerId: string, productId: string, quantity: number): Promise<boolean> {
    const product = database.inventory.find((item) => item.id === productId && item.tenantId === tenantId);
    if (!product) return false;
    product.warehouseStock = (product.warehouseStock || 0) - quantity;
    return true;
  }

  async recordRestock(tenantId: string, input: { productId: string; quantity: number; unitCost: number; supplier?: string; arrivedAt?: string; }): Promise<ProductRecord | null> {
    const product = database.inventory.find((item) => item.id === input.productId && item.tenantId === tenantId);
    if (!product) return null;

    const prevUnits = Number(product.totalPurchaseUnits || 0);
    const prevCost = Number(product.totalPurchaseCost || 0);
    const restockTotal = Number(input.unitCost) * Number(input.quantity);
    const newUnits = prevUnits + Number(input.quantity);
    const newCost = prevCost + restockTotal;
    const averageCost = newUnits > 0 ? Number((newCost / newUnits).toFixed(4)) : 0;
    const arrivedAt = input.arrivedAt || new Date().toISOString();

    product.stock += Math.abs(Number(input.quantity));
    product.lastCost = Number(input.unitCost);
    product.averageCost = averageCost;
    product.totalPurchaseUnits = newUnits;
    product.totalPurchaseCost = newCost;
    product.lastRestockedAt = arrivedAt;
    product.restocks = product.restocks || [];
    product.restocks.push({
      date: arrivedAt,
      supplier: input.supplier,
      quantity: Number(input.quantity),
      unitCost: Number(input.unitCost),
      totalCost: restockTotal
    });

    return product;
  }
}
