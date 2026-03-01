import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UserRole, type UserRole as UserRoleType } from '../../domain/roles';

type AppointmentStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_ASISTIO';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRoleType;
  active: boolean;
  whatsappConsent: boolean;
  approved: boolean;
  resetTokenHash?: string | null;
  resetTokenExpiresAt?: string | null;
  tenantId: string | null;
  branchIds: string[];
  createdAt: string;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  maxBranches: number;
  maxBarbers: number;
  maxMonthlyAppointments: number;
  features: string[];
};

type Tenant = {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  planId: string;
  planName?: string;
  status: string;
  customColors?: {
    primary?: string;
    secondary?: string;
  };
  logoUrl?: string | null;
  config: AppConfig & {
    bufferTimeMinutes: number;
    requirePaymentForNoShows: boolean;
    maxNoShowsBeforePayment: number;
  };
};

type Branch = {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone?: string;
  active: boolean;
  createdAt: string;
};

type Service = {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  active: boolean;
};

type Appointment = {
  id: string;
  tenantId: string;
  branchId: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
};

type AppConfig = {
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

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const tomorrowAt10 = new Date(tomorrow);
tomorrowAt10.setHours(10, 0, 0, 0);

export const database: {
  users: User[];
  plans: Plan[];
  tenants: Tenant[];
  branches: Branch[];
  services: Service[];
  barberSchedules: Array<Record<string, unknown>>;
  barberBlocks: Array<Record<string, unknown>>;
  appointments: Appointment[];
  appointmentHistory: Array<Record<string, unknown>>;
  whatsappLogs: Array<Record<string, unknown>>;
  appConfig: AppConfig;
} = {
  plans: [
    {
      id: 'plan_trial',
      name: 'Trial',
      price: 0,
      maxBranches: 1,
      maxBarbers: 2,
      maxMonthlyAppointments: 80,
      features: ['reports']
    },
    {
      id: 'plan_pro',
      name: 'Pro',
      price: 49,
      maxBranches: 5,
      maxBarbers: 15,
      maxMonthlyAppointments: 1000,
      features: ['reports', 'whatsapp_custom']
    }
  ],
  tenants: [
    {
      id: 'default_tenant',
      name: 'Barberia Noir',
      slug: 'noir',
      subdomain: 'noir',
      planId: 'plan_pro',
      planName: 'Pro',
      status: 'active',
      customColors: {
        primary: '#f59e0b',
        secondary: '#fde68a'
      },
      logoUrl: null,
      config: {
        minAdvanceMinutes: 60,
        cancelLimitMinutes: 120,
        rescheduleLimitMinutes: 120,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        reminderMinutes: [120, 1440],
        whatsappEnabledEvents: {
          APPOINTMENT_CREATED: true,
          APPOINTMENT_CONFIRMED: true,
          APPOINTMENT_RESCHEDULED: true,
          APPOINTMENT_CANCELLED: true,
          APPOINTMENT_COMPLETED: false,
          APPOINTMENT_REASSIGNED: true,
          APPOINTMENT_UPDATED: true,
          APPOINTMENT_REMINDER: true
        },
        whatsappTemplates: {
          APPOINTMENT_CREATED: 'Tu cita fue creada para {fecha}.',
          APPOINTMENT_CONFIRMED: 'Tu cita fue confirmada para {fecha}.',
          APPOINTMENT_RESCHEDULED: 'Tu cita fue reprogramada para {fecha}.',
          APPOINTMENT_CANCELLED: 'Tu cita fue cancelada.',
          APPOINTMENT_COMPLETED: 'Tu cita fue completada. Gracias por tu visita.',
          APPOINTMENT_REASSIGNED: 'Tu cita fue reasignada. Te esperamos el {fecha}.',
          APPOINTMENT_UPDATED: 'Tu cita cambio al estado {estado}.',
          APPOINTMENT_REMINDER: 'Recordatorio: tu cita es el {fecha}.'
        },
        whatsappDebounceSeconds: 60,
        bufferTimeMinutes: 10,
        requirePaymentForNoShows: false,
        maxNoShowsBeforePayment: 3
      }
    }
  ],
  branches: [
    {
      id: 'default_branch',
      tenantId: 'default_tenant',
      name: 'Sede Principal',
      address: 'Pendiente',
      phone: '+573000000000',
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  users: [
    {
      id: randomUUID(),
      name: 'God Root',
      email: 'god@barberia.com',
      phone: '+573000000000',
      passwordHash: bcrypt.hashSync('god123', 10),
      role: UserRole.GOD,
      active: true,
      whatsappConsent: true,
      approved: true,
      tenantId: null,
      branchIds: [],
      createdAt: new Date().toISOString()
    },
    {
      id: randomUUID(),
      name: 'Administrador',
      email: 'admin@barberia.com',
      phone: '+573000000001',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: UserRole.ADMIN,
      active: true,
      whatsappConsent: true,
      approved: true,
      tenantId: 'default_tenant',
      branchIds: ['default_branch'],
      createdAt: new Date().toISOString()
    },
    {
      id: randomUUID(),
      name: 'Barbero Demo',
      email: 'barbero@barberia.com',
      phone: '+573000000002',
      passwordHash: bcrypt.hashSync('barbero123', 10),
      role: UserRole.BARBER,
      active: true,
      whatsappConsent: true,
      approved: true,
      tenantId: 'default_tenant',
      branchIds: ['default_branch'],
      createdAt: new Date().toISOString()
    },
    {
      id: randomUUID(),
      name: 'Cliente Demo',
      email: 'cliente@barberia.com',
      phone: '+573000000003',
      passwordHash: bcrypt.hashSync('cliente123', 10),
      role: UserRole.CLIENT,
      active: true,
      whatsappConsent: true,
      approved: true,
      tenantId: 'default_tenant',
      branchIds: [],
      createdAt: new Date().toISOString()
    }
  ],
  services: [
    {
      id: randomUUID(),
      tenantId: 'default_tenant',
      name: 'Corte clásico',
      description: 'Corte tradicional con máquina y tijera.',
      durationMinutes: 30,
      price: 12,
      active: true
    },
    {
      id: randomUUID(),
      tenantId: 'default_tenant',
      name: 'Barba premium',
      description: 'Perfilado y arreglo de barba.',
      durationMinutes: 25,
      price: 10,
      active: true
    }
  ],
  barberSchedules: [],
  barberBlocks: [],
  appointments: [
    {
      id: randomUUID(),
      tenantId: 'default_tenant',
      branchId: 'default_branch',
      clientId: '',
      barberId: '',
      serviceId: '',
      startAt: tomorrowAt10.toISOString(),
      endAt: new Date(tomorrowAt10.getTime() + 30 * 60 * 1000).toISOString(),
      status: 'PENDIENTE',
      notes: 'Seed appointment',
      createdAt: new Date().toISOString()
    }
  ],
  appointmentHistory: [],
  whatsappLogs: [],
  appConfig: {
    minAdvanceMinutes: 60,
    cancelLimitMinutes: 120,
    rescheduleLimitMinutes: 120,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    reminderMinutes: [120, 1440],
    whatsappDebounceSeconds: 60,
    whatsappEnabledEvents: {
      APPOINTMENT_CREATED: true,
      APPOINTMENT_CONFIRMED: true,
      APPOINTMENT_RESCHEDULED: true,
      APPOINTMENT_CANCELLED: true,
      APPOINTMENT_COMPLETED: false,
      APPOINTMENT_REASSIGNED: true,
      APPOINTMENT_UPDATED: true,
      APPOINTMENT_REMINDER: true
    },
    whatsappTemplates: {
      APPOINTMENT_CREATED: 'Tu cita fue creada para {fecha}.',
      APPOINTMENT_CONFIRMED: 'Tu cita fue confirmada para {fecha}.',
      APPOINTMENT_RESCHEDULED: 'Tu cita fue reprogramada para {fecha}.',
      APPOINTMENT_CANCELLED: 'Tu cita fue cancelada.',
      APPOINTMENT_COMPLETED: 'Tu cita fue completada. Gracias por tu visita.',
      APPOINTMENT_REASSIGNED: 'Tu cita fue reasignada. Te esperamos el {fecha}.',
      APPOINTMENT_UPDATED: 'Tu cita cambio al estado {estado}.',
      APPOINTMENT_REMINDER: 'Recordatorio: tu cita es el {fecha}.'
    }
  }
};

function hydrateSeedRelations() {
  const admin = database.users.find((user) => user.role === UserRole.ADMIN);
  const barber = database.users.find((user) => user.role === UserRole.BARBER);
  const client = database.users.find((user) => user.role === UserRole.CLIENT);
  const service = database.services[0];
  const firstAppointment = database.appointments[0];

  if (admin && barber && client && service && firstAppointment) {
    firstAppointment.clientId = client.id;
    firstAppointment.barberId = barber.id;
    firstAppointment.serviceId = service.id;
  }
}

hydrateSeedRelations();
