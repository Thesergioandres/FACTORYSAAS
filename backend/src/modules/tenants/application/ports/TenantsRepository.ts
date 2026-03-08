export interface TenantEntity {
  id: string;
  slug: string;
  name: string;
  subdomain: string;
  verticalSlug: string;
  activeModules: string[];
  legalConsent?: {
    acceptedAt?: string;
    termsVersion?: string;
    privacyVersion?: string;
    dataTreatmentVersion?: string;
    cookiesVersion?: string;
    dpaVersion?: string;
    saasVersion?: string;
  };
  businessHours?: Array<{
    day: number;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  }>;
  status: string;
  planId: string;
  planName?: string;
  email?: string | null;
  phone?: string | null;
  country?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
  };
  logoUrl?: string | null;
  validUntil?: string | null;
  createdAt?: string;
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
