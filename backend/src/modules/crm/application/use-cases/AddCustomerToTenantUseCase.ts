import type { CustomersRepository, CreateCustomerInput } from '../ports/CustomersRepository';

export class AddCustomerToTenantUseCase {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async execute(input: CreateCustomerInput) {
    if (!input.tenantId) {
      return { error: 'tenantId requerido', statusCode: 400 } as const;
    }

    if (!input.name?.trim()) {
      return { error: 'name requerido', statusCode: 400 } as const;
    }

    const customer = await this.customersRepository.create({
      ...input,
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      notes: input.notes?.trim() || null,
      tags: Array.isArray(input.tags) ? input.tags : []
    });

    return { customer } as const;
  }
}
