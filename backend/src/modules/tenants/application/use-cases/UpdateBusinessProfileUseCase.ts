import type { BusinessProfile, TenantsRepository } from '../ports/TenantsRepository';

type UpdateBusinessProfileInput = {
  tenantId: string;
  slug: string;
  name: string;
  phone: string;
  address: string;
  logoUrl: string;
  primaryColor: string;
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export class UpdateBusinessProfileUseCase {
  constructor(private readonly tenantsRepository: TenantsRepository) {}

  async execute(input: UpdateBusinessProfileInput) {
    if (!input.tenantId) {
      return { error: 'tenantId requerido', statusCode: 400 } as const;
    }

    const normalizedSlug = normalizeSlug(input.slug || '');
    if (!normalizedSlug) {
      return { error: 'slug invalido', statusCode: 400 } as const;
    }

    if (!input.name?.trim() || !input.phone?.trim() || !input.address?.trim()) {
      return { error: 'name, phone y address son requeridos', statusCode: 400 } as const;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(input.primaryColor || '')) {
      return { error: 'primaryColor debe estar en formato HEX #RRGGBB', statusCode: 400 } as const;
    }

    const tenant = await this.tenantsRepository.findById(input.tenantId);
    if (!tenant) {
      return { error: 'Tenant no encontrado', statusCode: 404 } as const;
    }

    const existing = await this.tenantsRepository.findByBusinessProfileSlug(normalizedSlug);
    if (existing && existing.id !== input.tenantId) {
      return { error: 'businessProfile.slug ya esta en uso', statusCode: 409 } as const;
    }

    const businessProfile: BusinessProfile = {
      slug: normalizedSlug,
      name: input.name.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      logoUrl: input.logoUrl?.trim() || '',
      primaryColor: input.primaryColor
    };

    const updated = await this.tenantsRepository.update(input.tenantId, {
      businessProfile,
      logoUrl: businessProfile.logoUrl || tenant.logoUrl,
      customColors: {
        primary: businessProfile.primaryColor,
        secondary: tenant.customColors?.secondary
      }
    });

    if (!updated) {
      return { error: 'Tenant no encontrado', statusCode: 404 } as const;
    }

    return { tenant: updated } as const;
  }
}
