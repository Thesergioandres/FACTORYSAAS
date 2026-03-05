import mongoose, { type Model } from 'mongoose';
import { TenantStatus } from '../../../../modules/tenants/domain/enums/TenantEnums';

type TenantDocument = {
  name: string;
  slug: string;
  planId: string;
  subdomain: string;
  verticalSlug: string;
  activeModules: string[];
  businessHours: Array<{
    day: number;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  }>;
  email?: string | null;
  phone?: string | null;
  customColors?: {
    primary?: string;
    secondary?: string;
  };
  logoUrl?: string | null;
  status: TenantStatus;
  validUntil?: Date | null;
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
  createdAt: Date;
  updatedAt: Date;
};

const tenantSchema = new mongoose.Schema<TenantDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    planId: { type: String, required: true, index: true },
    subdomain: { type: String, required: true, unique: true, index: true },
    verticalSlug: { type: String, required: true, index: true },
    activeModules: { type: [String], default: [] },
    businessHours: {
      type: [
        {
          day: { type: Number, required: true },
          openTime: { type: String, required: true },
          closeTime: { type: String, required: true },
          isOpen: { type: Boolean, default: true }
        }
      ],
      default: () => [
        { day: 0, openTime: '09:00', closeTime: '18:00', isOpen: true },
        { day: 1, openTime: '09:00', closeTime: '18:00', isOpen: true },
        { day: 2, openTime: '09:00', closeTime: '18:00', isOpen: true },
        { day: 3, openTime: '09:00', closeTime: '18:00', isOpen: true },
        { day: 4, openTime: '09:00', closeTime: '18:00', isOpen: true },
        { day: 5, openTime: '09:00', closeTime: '18:00', isOpen: true },
        { day: 6, openTime: '09:00', closeTime: '18:00', isOpen: true }
      ]
    },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    customColors: {
      primary: { type: String, default: '#f59e0b' },
      secondary: { type: String, default: '#facc15' }
    },
    logoUrl: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(TenantStatus),
      default: TenantStatus.TRIAL,
      index: true
    },
    validUntil: { type: Date, default: null },
    config: {
      bufferTimeMinutes: { type: Number, default: 10 },
      requirePaymentForNoShows: { type: Boolean, default: false },
      maxNoShowsBeforePayment: { type: Number, default: 3 },
      minAdvanceMinutes: { type: Number, default: 60 },
      cancelLimitMinutes: { type: Number, default: 120 },
      rescheduleLimitMinutes: { type: Number, default: 120 },
      quietHoursStart: { type: String, default: '22:00' },
      quietHoursEnd: { type: String, default: '07:00' },
      reminderMinutes: { type: [Number], default: [120, 1440] },
      whatsappEnabledEvents: {
        type: Object,
        default: {
          APPOINTMENT_CREATED: true,
          APPOINTMENT_CONFIRMED: true,
          APPOINTMENT_RESCHEDULED: true,
          APPOINTMENT_CANCELLED: true,
          APPOINTMENT_COMPLETED: false,
          APPOINTMENT_REASSIGNED: true,
          APPOINTMENT_UPDATED: true,
          APPOINTMENT_REMINDER: true
        }
      },
      whatsappTemplates: {
        type: Object,
        default: {
          APPOINTMENT_CREATED: 'Tu cita fue creada para {fecha}.',
          APPOINTMENT_CONFIRMED: 'Tu cita fue confirmada para {fecha}.',
          APPOINTMENT_RESCHEDULED: 'Tu cita fue reprogramada para {fecha}.',
          APPOINTMENT_CANCELLED: 'Tu cita fue cancelada.',
          APPOINTMENT_COMPLETED: 'Tu cita fue completada. Gracias por tu visita.',
          APPOINTMENT_REASSIGNED: 'Tu cita fue reasignada. Te esperamos el {fecha}.',
          APPOINTMENT_UPDATED: 'Tu cita cambio al estado {estado}.',
          APPOINTMENT_REMINDER: 'Recordatorio: tu cita es el {fecha}.'
        }
      },
      whatsappDebounceSeconds: { type: Number, default: 60 }
    }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

tenantSchema.index({ status: 1, planId: 1 });

export const TenantModel: Model<TenantDocument> =
  (mongoose.models.Tenant as Model<TenantDocument>) ||
  mongoose.model('Tenant', tenantSchema);
