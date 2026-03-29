import mongoose from 'mongoose';
import type { PosRepository, CreatePosSaleInput } from '../ports/PosRepository';
import type { InventoryRepository } from '../../../inventory/application/ports/InventoryRepository';
import { FinanceService } from '../../../billing/domain/services/FinanceService';

export class RegisterSaleUseCase {
  constructor(
    private readonly deps: { posRepository: PosRepository; inventoryRepository: InventoryRepository }
  ) {}

  private error(message: string, statusCode: number) {
    return { error: message, statusCode } as const;
  }

  async execute(input: {
    tenantId: string;
    sellerId?: string;
    role: string;
    items: Array<{ productId: string; name: string; quantity: number; price: number }>;
    paymentMethod?: string;
    tableId?: string;
  }) {
    if (!input.items || input.items.length === 0) {
      return this.error('Items requeridos', 400);
    }

    const { tenantId, sellerId, role, items, paymentMethod, tableId } = input;
    const isCredit = (paymentMethod || '').toUpperCase() === 'CREDIT';
    const paymentStatus = isCredit ? 'pendiente' : 'confirmado';

    let total = 0;
    let totalCost = 0;

    const session = await mongoose.startSession();
    let saleResult;

    try {
      session.startTransaction();

      for (const item of items) {
        if (!item.productId || Number(item.quantity) <= 0) {
          throw new Error('Cada item debe incluir productId y quantity > 0');
        }

        const product = await this.deps.inventoryRepository.findById(item.productId, tenantId);
        if (!product || !product.active) {
          throw new Error(`Producto ${item.name || item.productId} no disponible`);
        }

        // Ceguera y transaccionalidad: si es SELLER (o sellerId existe con rol SELLER) descuenta de SellerStock. Si es ADMIN descuenta de warehouseStock.
        const isSeller = role === 'SELLER';
        const targetSellerId = isSeller ? sellerId : undefined;

        if (!isSeller) {
          if ((product.warehouseStock || 0) < item.quantity) {
             throw new Error(`Stock de almacén insuficiente para ${product.name}`);
          }
        }

        const updatedProduct = await this.deps.inventoryRepository.decrementStock(
          tenantId,
          item.productId,
          item.quantity,
          targetSellerId,
          { session }
        );

        if (!updatedProduct) {
           throw new Error(`No se pudo actualizar stock de ${product.name} (posible insuficiencia en inventario de vendedor/bodega)`);
        }

        const itemTotal = Number(item.price) * Number(item.quantity);
        total += itemTotal;
        const itemCost = (product.averageCost || product.lastCost || 0) * Number(item.quantity);
        totalCost += itemCost;
      }

      // Si es un vendedor podemos calcular sus comisiones
      let sellerCommission = 0;
      if (role === 'SELLER') {
         // Lógica ilustrativa de FinanceService usando los métodos estáticos puros
         const basePrice = FinanceService.calculateSellerPrice(total, 20); // asume comisión 20% flat o por item
         sellerCommission = total - basePrice; 
      }
      
      const adminGrossProfit = FinanceService.calculateAdminProfit(total / items.reduce((a, b) => a + b.quantity, 0), totalCost / items.reduce((a, b) => a + b.quantity, 0), sellerCommission, items.reduce((a, b) => a + b.quantity, 0));
      const netProfit = FinanceService.calculateNetProfit(adminGrossProfit, 0, 0);

      const createSaleInput: CreatePosSaleInput = {
        tenantId,
        sellerId,
        tableId,
        items,
        paymentMethod: paymentMethod || 'CASH',
        paymentStatus
      };

      const partialSale = await this.deps.posRepository.createSale(createSaleInput, { session });
      
      // Patch local para devolver el net profit si hiciera falta 
      saleResult = { ...partialSale };
      
      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();
      return this.error(error?.message || 'Error en la transacción de venta', 500);
    } finally {
      await session.endSession();
    }

    return { sale: saleResult } as const;
  }
}
