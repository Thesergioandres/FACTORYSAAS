import type { TenantsRepository } from '../../../../modules/tenants/application/ports/TenantsRepository';

export type UpdateSubscriptionStatusInput = {
  tenantId: string;
  planId?: string;
  planName?: string;
  status: 'active' | 'suspended';
  validUntil?: Date;
};

export class UpdateSubscriptionStatusUseCase {
  constructor(private readonly tenantsRepository: TenantsRepository) {}

  async execute(input: UpdateSubscriptionStatusInput): Promise<{ success: boolean; error?: string }> {
    const tenant = await this.tenantsRepository.findById(input.tenantId);
    if (!tenant) {
      return { success: false, error: 'Tenant no encontrado' };
    }

    const payload: { status: string; planId?: string; planName?: string; validUntil?: string } = {
      status: input.status,
    };

    if (input.planId) payload.planId = input.planId;
    if (input.planName) payload.planName = input.planName;
    if (input.validUntil) payload.validUntil = input.validUntil.toISOString();

    await this.tenantsRepository.update(input.tenantId, payload);

    return { success: true };
  }
}
