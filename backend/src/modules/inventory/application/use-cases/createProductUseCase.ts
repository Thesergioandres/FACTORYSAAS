import type { InventoryRepository } from '../ports/InventoryRepository';

export class CreateProductUseCase {
  constructor(private readonly deps: { inventoryRepository: InventoryRepository }) {}

  private error(message: string, statusCode: number) {
    return { error: message, statusCode };
  }

  async execute({
    tenantId,
    name,
    sku,
    description,
    price,
    stock,
    active
  }: {
    tenantId?: string;
    name?: string;
    sku?: string;
    description?: string;
    price?: number;
    stock?: number;
    active?: boolean;
  }): Promise<{ product: Awaited<ReturnType<InventoryRepository['create']>> } | { error: string; statusCode: number }> {
    if (!tenantId) {
      return this.error('tenantId es requerido', 400);
    }
    if (!name || price === undefined || stock === undefined) {
      return this.error('name, price y stock son requeridos', 400);
    }
    if (Number(price) < 0 || Number(stock) < 0) {
      return this.error('price y stock no pueden ser negativos', 400);
    }

    const product = await this.deps.inventoryRepository.create({
      tenantId,
      name,
      sku,
      description,
      price: Number(price),
      stock: Number(stock),
      active
    });

    return { product };
  }
}
