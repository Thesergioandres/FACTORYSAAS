export type TaxResult = {
  country: string;
  taxRate: number;
  taxAmount: number;
  total: number;
};

const TAX_RATES: Record<string, number> = {
  CO: 0.19,
  MX: 0.16,
  ES: 0.21,
  AR: 0.21,
  US: 0
};

export class TaxCalculatorService {
  calculate(countryCode: string, subtotal: number): TaxResult {
    const normalized = countryCode.trim().toUpperCase();
    const taxRate = TAX_RATES[normalized] ?? 0;
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));
    return {
      country: normalized,
      taxRate,
      taxAmount,
      total
    };
  }
}
