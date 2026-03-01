import { FactoryService } from '../../../tenants/application/FactoryService';

function isE164(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export class RegisterTenantAdminUseCase {
  constructor(private readonly deps: { factoryService: FactoryService }) {}

  private error(message: string, statusCode: number) {
    return { error: message, statusCode };
  }

  async execute(input: {
    tenantName?: string;
    slug?: string;
    subdomain?: string;
    customColors?: { primary?: string; secondary?: string };
    logoUrl?: string | null;
    adminName?: string;
    adminEmail?: string;
    adminPhone?: string;
    adminPassword?: string;
    branchName?: string;
    branchAddress?: string;
  }) {
    if (input.adminPhone && !isE164(input.adminPhone)) {
      return this.error('adminPhone debe estar en formato E.164', 400);
    }

    const result = await this.deps.factoryService.provisionTenantAdmin(input);
    if ('error' in result) {
      return this.error(result.error, result.statusCode);
    }

    return result;
  }
}
