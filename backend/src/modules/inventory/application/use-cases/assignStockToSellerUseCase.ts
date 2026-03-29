import type { InventoryRepository } from '../ports/InventoryRepository';

export class AssignStockToSellerUseCase {
  constructor(private readonly deps: { inventoryRepository: InventoryRepository }) {}

  async execute(tenantId: string, sellerId: string, productId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
    try {
      if (quantity <= 0) return { success: false, error: 'La cantidad debe ser mayor a cero' };
      const success = await this.deps.inventoryRepository.assignToSeller(tenantId, sellerId, productId, quantity);
      return { success };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al asignar stock' };
    }
  }
}
