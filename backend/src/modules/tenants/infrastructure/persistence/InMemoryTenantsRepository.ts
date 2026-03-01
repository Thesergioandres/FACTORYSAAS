import { randomUUID } from 'crypto';
import type { TenantsRepository, TenantEntity, CreateTenantInput, UpdateTenantInput } from '../../application/ports/TenantsRepository';
import { database } from '../../../../shared/infrastructure/memory/database';

function mapTenant(tenant: TenantEntity): TenantEntity {
  return {
    ...tenant,
    customColors: tenant.customColors ? { ...tenant.customColors } : undefined,
    config: {
      ...tenant.config,
      reminderMinutes: [...tenant.config.reminderMinutes],
      whatsappEnabledEvents: { ...tenant.config.whatsappEnabledEvents },
      whatsappTemplates: { ...tenant.config.whatsappTemplates }
    }
  };
}

export class InMemoryTenantsRepository implements TenantsRepository {
  async listAll() {
    return database.tenants.map(mapTenant);
  }

  async findById(id: string) {
    const tenant = database.tenants.find((item) => item.id === id);
    return tenant ? mapTenant(tenant) : null;
  }

  async findBySlug(slug: string) {
    const tenant = database.tenants.find((item) => item.slug === slug || item.subdomain === slug);
    return tenant ? mapTenant(tenant) : null;
  }

  async create(input: CreateTenantInput) {
    const tenant: TenantEntity = { id: randomUUID(), ...input };
    database.tenants.push(tenant);
    return mapTenant(tenant);
  }

  async update(id: string, input: UpdateTenantInput) {
    const tenant = database.tenants.find((item) => item.id === id);
    if (!tenant) return null;

    if (input.name !== undefined) tenant.name = input.name;
    if (input.subdomain !== undefined) tenant.subdomain = input.subdomain;
    if (input.status !== undefined) tenant.status = input.status;
    if (input.planId !== undefined) tenant.planId = input.planId;
    if (input.planName !== undefined) tenant.planName = input.planName;
    if (input.customColors !== undefined) tenant.customColors = { ...input.customColors };
    if (input.logoUrl !== undefined) tenant.logoUrl = input.logoUrl;
    if (input.config !== undefined) {
      tenant.config = {
        ...tenant.config,
        ...input.config,
        reminderMinutes: input.config.reminderMinutes ?? tenant.config.reminderMinutes,
        whatsappEnabledEvents: input.config.whatsappEnabledEvents ?? tenant.config.whatsappEnabledEvents,
        whatsappTemplates: input.config.whatsappTemplates ?? tenant.config.whatsappTemplates
      };
    }

    return mapTenant(tenant);
  }
}
