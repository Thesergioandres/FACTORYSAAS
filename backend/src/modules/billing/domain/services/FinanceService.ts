export class FinanceService {
  /**
   * Retorna el precio base para el vendedor (precio descontando su comisión).
   */
  static calculateSellerPrice(salePrice: number, commissionPercentage: number = 20): number {
    if (salePrice < 0) throw new Error('Sale price cannot be negative');
    return salePrice * ((100 - commissionPercentage) / 100);
  }

  /**
   * Retorna la ganancia total del empleado/vendedor en la venta
   */
  static calculateSellerCommission(salePrice: number, sellerPrice: number, quantity: number): number {
    return (salePrice - sellerPrice) * quantity;
  }

  /**
   * Ganancia bruta del administrador/dueño de la tienda
   */
  static calculateAdminProfit(salePrice: number, costBasis: number, sellerCommission: number, quantity: number): number {
    const totalRevenue = salePrice * quantity;
    const totalCost = costBasis * quantity;
    return totalRevenue - totalCost - sellerCommission;
  }

  /**
   * Flujo de caja real o utilidad neta
   */
  static calculateNetProfit(totalProfit: number, totalExtraCosts: number, discount: number = 0): number {
    return totalProfit - totalExtraCosts - discount;
  }
}
