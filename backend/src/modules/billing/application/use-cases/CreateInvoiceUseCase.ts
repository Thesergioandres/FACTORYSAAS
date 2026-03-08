import type { InvoicesRepository } from '../ports/InvoicesRepository';
import type { TenantsRepository } from '../../tenants/application/ports/TenantsRepository';
import { TaxCalculatorService } from '../services/TaxCalculatorService';

export class CreateInvoiceUseCase {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly tenantsRepository: TenantsRepository,
    private readonly taxCalculator: TaxCalculatorService
  ) {}

  async execute(input: { tenantId: string; subtotal: number; currency: string }) {
    if (!input.tenantId) {
      return { error: 'tenantId requerido', statusCode: 400 } as const;
    }

    if (!Number.isFinite(input.subtotal) || input.subtotal <= 0) {
      return { error: 'subtotal invalido', statusCode: 400 } as const;
    }

    const tenant = await this.tenantsRepository.findById(input.tenantId);
    if (!tenant) {
      return { error: 'Tenant no encontrado', statusCode: 404 } as const;
    }

    const country = tenant.country || 'CO';
    const tax = this.taxCalculator.calculate(country, input.subtotal);

    const invoice = await this.invoicesRepository.create({
      tenantId: input.tenantId,
      subtotal: input.subtotal,
      taxAmount: tax.taxAmount,
      total: tax.total,
      currency: input.currency,
      country: tax.country
    });

    return { invoice } as const;
  }
}
