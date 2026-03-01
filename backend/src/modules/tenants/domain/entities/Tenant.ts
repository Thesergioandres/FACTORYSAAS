import { TenantStatus } from '../enums/TenantEnums';

type TenantProps = {
  id: string;
  name: string;
  slug: string;
  planId: string;
  planName?: string;
  subdomain: string;
  customColors?: {
    primary?: string;
    secondary?: string;
  };
  logoUrl?: string | null;
  status: TenantStatus;
  config?: {
    bufferTimeMinutes?: number;
    requirePaymentForNoShows?: boolean;
    maxNoShowsBeforePayment?: number;
    minAdvanceMinutes?: number;
    cancelLimitMinutes?: number;
    rescheduleLimitMinutes?: number;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    reminderMinutes?: number[];
    whatsappEnabledEvents?: Record<string, boolean>;
    whatsappTemplates?: Record<string, string>;
    whatsappDebounceSeconds?: number;
  };
  createdAt: string;
};

export type TenantRecord = TenantProps;

export class Tenant {
  id: string;
  name: string;
  slug: string;
  planId: string;
  planName?: string;
  subdomain: string;
  customColors?: {
    primary?: string;
    secondary?: string;
  };
  logoUrl?: string | null;
  status: TenantStatus;
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
  createdAt: string;

  constructor(props: TenantProps) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.planId = props.planId;
    this.planName = props.planName;
    this.subdomain = props.subdomain;
    this.customColors = props.customColors;
    this.logoUrl = props.logoUrl ?? null;
    this.status = props.status;
    this.config = {
      bufferTimeMinutes: props.config?.bufferTimeMinutes ?? 10,
      requirePaymentForNoShows: props.config?.requirePaymentForNoShows ?? false,
      maxNoShowsBeforePayment: props.config?.maxNoShowsBeforePayment ?? 3,
      minAdvanceMinutes: props.config?.minAdvanceMinutes ?? 60,
      cancelLimitMinutes: props.config?.cancelLimitMinutes ?? 120,
      rescheduleLimitMinutes: props.config?.rescheduleLimitMinutes ?? 120,
      quietHoursStart: props.config?.quietHoursStart ?? '22:00',
      quietHoursEnd: props.config?.quietHoursEnd ?? '07:00',
      reminderMinutes: props.config?.reminderMinutes ?? [120, 1440],
      whatsappEnabledEvents: props.config?.whatsappEnabledEvents ?? {
        APPOINTMENT_CREATED: true,
        APPOINTMENT_CONFIRMED: true,
        APPOINTMENT_RESCHEDULED: true,
        APPOINTMENT_CANCELLED: true,
        APPOINTMENT_COMPLETED: false,
        APPOINTMENT_REASSIGNED: true,
        APPOINTMENT_UPDATED: true,
        APPOINTMENT_REMINDER: true
      },
      whatsappTemplates: props.config?.whatsappTemplates ?? {
        APPOINTMENT_CREATED: 'Tu cita fue creada para {fecha}.',
        APPOINTMENT_CONFIRMED: 'Tu cita fue confirmada para {fecha}.',
        APPOINTMENT_RESCHEDULED: 'Tu cita fue reprogramada para {fecha}.',
        APPOINTMENT_CANCELLED: 'Tu cita fue cancelada.',
        APPOINTMENT_COMPLETED: 'Tu cita fue completada. Gracias por tu visita.',
        APPOINTMENT_REASSIGNED: 'Tu cita fue reasignada. Te esperamos el {fecha}.',
        APPOINTMENT_UPDATED: 'Tu cita cambio al estado {estado}.',
        APPOINTMENT_REMINDER: 'Recordatorio: tu cita es el {fecha}.'
      },
      whatsappDebounceSeconds: props.config?.whatsappDebounceSeconds ?? 60
    };
    this.createdAt = props.createdAt;
  }

  getBufferTime(): number {
    return this.config.bufferTimeMinutes;
  }

  isActive(): boolean {
    return this.status === TenantStatus.ACTIVE;
  }
}
