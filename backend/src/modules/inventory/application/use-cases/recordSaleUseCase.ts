import type { InventoryRepository, SaleItemInput } from '../ports/InventoryRepository';

export class RecordSaleUseCase {
  constructor(private readonly deps: { inventoryRepository: InventoryRepository }) {}

  private error(message: string, statusCode: number) {
    return { error: message, statusCode };
  }

  async execute({ tenantId, items }: { tenantId?: string; items?: SaleItemInput[] }): Promise<{ products: Array<{ id: string; stock: number }>; total: number } | { error: string; statusCode: number }> {
    if (!tenantId) {
      return this.error('tenantId es requerido', 400);
    }
    if (!items || items.length === 0) {
      return this.error('items es requerido', 400);
    }

    let total = 0;
    const updated: Array<{ id: string; stock: number }> = [];

    for (const item of items) {
      if (!item.productId || Number(item.quantity) <= 0) {
        return this.error('Cada item debe incluir productId y quantity > 0', 400);
      }

      const product = await this.deps.inventoryRepository.findById(item.productId, tenantId);
      if (!product || !product.active) {
        return this.error('Producto no disponible', 404);
      }

      if (product.stock < item.quantity) {
        return this.error(`Stock insuficiente para ${product.name}`, 409);
      }

      const updatedProduct = await this.deps.inventoryRepository.decrementStock(tenantId, item.productId, item.quantity);
      if (!updatedProduct) {
        return this.error('No se pudo actualizar stock', 500);
      }

      total += Number(product.price) * Number(item.quantity);
      updated.push({ id: updatedProduct.id, stock: updatedProduct.stock });
    }

    return { products: updated, total: Number(total.toFixed(2)) };
  }
}
