import { FinanceService } from './FinanceService';

describe('FinanceService', () => {
  it('calculateSellerPrice should return price discounting commission', () => {
    expect(FinanceService.calculateSellerPrice(100, 20)).toBe(80);
    expect(FinanceService.calculateSellerPrice(500, 10)).toBe(450);
    // Pruebas con decimales
    expect(FinanceService.calculateSellerPrice(150.5, 15)).toBeCloseTo(127.925);
  });

  it('calculateSellerPrice should throw if sale price is negative', () => {
    expect(() => FinanceService.calculateSellerPrice(-50, 20)).toThrow('Sale price cannot be negative');
  });

  it('calculateSellerCommission should return (salePrice - sellerPrice) * quantity', () => {
    expect(FinanceService.calculateSellerCommission(100, 80, 2)).toBe(40);
    expect(FinanceService.calculateSellerCommission(200, 150, 3)).toBe(150);
    expect(FinanceService.calculateSellerCommission(150.5, 127.925, 2)).toBeCloseTo(45.15);
  });

  it('calculateAdminProfit should calculate gross profit for admin subtracting seller commission', () => {
    expect(FinanceService.calculateAdminProfit(100, 50, 40, 2)).toBe(60);
    expect(FinanceService.calculateAdminProfit(300, 100, 50, 1)).toBe(150);
  });

  it('calculateNetProfit should calculate cashflow minus extra costs and discounts', () => {
    expect(FinanceService.calculateNetProfit(60, 10, 5)).toBe(45);
    expect(FinanceService.calculateNetProfit(150, 0, 0)).toBe(150);
    // Pruebas con decimales exactos
    expect(FinanceService.calculateNetProfit(1500.55, 300.20, 10.10)).toBeCloseTo(1190.25);
  });
});
