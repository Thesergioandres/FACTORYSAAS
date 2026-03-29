import { SaleModel } from '../../../../shared/infrastructure/mongoose/models/SaleModel';
import type { InventoryRepository } from '../../../inventory/application/ports/InventoryRepository';

export class CancelSaleUseCase {
  constructor(private readonly deps: { inventoryRepository: InventoryRepository }) {}

  async execute(tenantId: string, saleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sale = await SaleModel.findOne({ _id: saleId, tenantId }).lean();
      if (!sale) return { success: false, error: 'Venta no encontrada' };

      // Restore stock incrementally
      for (const item of sale.items) {
        await this.deps.inventoryRepository.restoreStock(tenantId, item.productId, item.quantity, sale.sellerId);
      }

      // Delete the sale logically or physically
      await SaleModel.deleteOne({ _id: saleId, tenantId });
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al restaurar inventario' };
    }
  }
}
