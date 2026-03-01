export interface TenantEntity {
  id: string;
  slug: string;
  name: string;
  subdomain: string;
  status: string;
  planId: string;
  planName?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
  };
  logoUrl?: string | null;
  config: {
    bufferTimeMinutes: number;
    requirePaymentForNoShows: boolean;
    maxNoShowsBeforePayment: number;
    minAdvanceMinutes: number;
    cancelLimitMinutes: number;
    rescheduleLimitMinutes: number;
    quietHoursStart: string;
    quietHoursEnd: string;
    reminderMinutes: number[];
    whatsappEnabledEvents: Record<string, boolean>;
    whatsappTemplates: Record<string, string>;
    whatsappDebounceSeconds: number;
  };
}

export type CreateTenantInput = Omit<TenantEntity, 'id'>;

export type UpdateTenantInput = Partial<Omit<TenantEntity, 'id' | 'slug'>>;

export interface TenantsRepository {
  findById(id: string): Promise<TenantEntity | null>;
  findBySlug(slug: string): Promise<TenantEntity | null>;
  listAll(): Promise<TenantEntity[]>;
  create(input: CreateTenantInput): Promise<TenantEntity>;
  update(id: string, input: UpdateTenantInput): Promise<TenantEntity | null>;
}
