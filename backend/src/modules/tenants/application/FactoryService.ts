import type { TenantsRepository, TenantEntity } from './ports/TenantsRepository';
import type { PlansRepository } from '../../plans/application/ports/PlansRepository';
import type { BranchesRepository } from '../../branches/application/ports/BranchesRepository';
import type { UsersRepository } from '../../users/application/ports/UsersRepository';
import { UserRole } from '../../../shared/domain/roles';

const DEFAULT_COLORS = {
  primary: '#f59e0b',
  secondary: '#fde68a'
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export class FactoryService {
  constructor(
    private readonly deps: {
      tenantsRepository: TenantsRepository;
      plansRepository: PlansRepository;
      branchesRepository: BranchesRepository;
      usersRepository: UsersRepository;
      defaultConfig: TenantEntity['config'];
    }
  ) {}

  private error(message: string, statusCode: number) {
    return { error: message, statusCode };
  }

  async provisionTenantAdmin(input: {
    tenantName?: string;
    slug?: string;
    subdomain?: string;
    verticalSlug?: string;
    activeModules?: string[];
    customColors?: { primary?: string; secondary?: string };
    logoUrl?: string | null;
    adminName?: string;
    adminEmail?: string;
    adminPhone?: string;
    adminPassword?: string;
    branchName?: string;
    branchAddress?: string;
    legalConsent?: {
      acceptedAt?: string;
      termsVersion?: string;
      privacyVersion?: string;
      dataTreatmentVersion?: string;
      cookiesVersion?: string;
      dpaVersion?: string;
      saasVersion?: string;
    };
  }) {
    const tenantName = input.tenantName?.trim();
    const adminName = input.adminName?.trim();
    const adminEmail = input.adminEmail?.trim();
    const adminPhone = input.adminPhone?.trim();
    const adminPassword = input.adminPassword;

    if (!tenantName || !adminName || !adminEmail || !adminPhone || !adminPassword) {
      return this.error('tenantName, adminName, adminEmail, adminPhone y adminPassword son requeridos', 400);
    }

    if (!input.legalConsent?.acceptedAt || !input.legalConsent?.termsVersion || !input.legalConsent?.dataTreatmentVersion) {
      return this.error('Consentimiento legal requerido', 400);
    }

    const slug = normalizeSlug(input.slug || tenantName);
    const subdomain = normalizeSlug(input.subdomain || slug);
    const verticalSlug = normalizeSlug(input.verticalSlug || '');

    if (!slug || !subdomain || !verticalSlug) {
      return this.error('slug/subdomain/verticalSlug invalido', 400);
    }

    const existing = await this.deps.tenantsRepository.findBySlug(slug);
    if (existing) {
      return this.error('slug ya registrado', 409);
    }

    const plan = await this.deps.plansRepository.findByName('Trial');
    if (!plan) {
      return this.error('Plan Trial no disponible', 500);
    }

    const tenant = await this.deps.tenantsRepository.create({
      name: tenantName,
      slug,
      subdomain,
      verticalSlug,
      activeModules: Array.isArray(input.activeModules) ? [...input.activeModules] : [],
      planId: plan.id,
      planName: plan.name,
      status: 'onboarding',
      email: adminEmail,
      phone: adminPhone,
      businessProfile: {
        slug,
        name: tenantName,
        phone: adminPhone,
        address: input.branchAddress?.trim() || 'Pendiente',
        logoUrl: input.logoUrl || '',
        primaryColor: input.customColors?.primary || DEFAULT_COLORS.primary
      },
      validUntil: null,
      createdAt: new Date().toISOString(),
      customColors: input.customColors || DEFAULT_COLORS,
      logoUrl: input.logoUrl ?? null,
      legalConsent: input.legalConsent,
      config: this.deps.defaultConfig
    });

    const branch = await this.deps.branchesRepository.create({
      tenantId: tenant.id,
      name: input.branchName?.trim() || 'Sede Principal',
      address: input.branchAddress?.trim() || 'Pendiente',
      phone: adminPhone,
      active: true
    });

    const user = await this.deps.usersRepository.create({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      password: adminPassword,
      role: UserRole.ADMIN,
      whatsappConsent: true,
      approved: true,
      tenantId: tenant.id,
      branchIds: [branch.id]
    });

    return { tenant, branch, user };
  }
}
