import mongoose from 'mongoose';
import { database } from '../../../shared/infrastructure/memory/database';
import { WhatsAppLogModel } from '../../../shared/infrastructure/mongoose/models/WhatsAppLogModel';
import type { TenantsRepository } from '../../tenants/application/ports/TenantsRepository';

type Recipient = {
  role: string;
  phone?: string;
  whatsappConsent?: boolean;
};

type Provider = {
  send(input: { appointmentId: string; tenantId: string; event: string; roleTarget: string; phone: string; message: string }): Promise<{ status: 'ENVIADO' | 'PENDIENTE' }>;
};

export class NotificationsService {
  constructor(
    private readonly provider: Provider,
    private readonly tenantsRepository: TenantsRepository
  ) {}

  async emitEvent({ event, appointment, recipients }: { event: string; appointment: { id: string; startAt: string; status?: string; tenantId: string }; recipients: Recipient[] }) {
    if (shouldDebounce(event)) {
      scheduleDebouncedSend({ event, appointment, recipients }, this.provider, this.tenantsRepository);
      return;
    }

    await sendNow({ event, appointment, recipients }, this.provider, this.tenantsRepository);
  }
}

type PendingPayload = { event: string; appointment: { id: string; startAt: string; status?: string; tenantId: string }; recipients: Recipient[] };
const pendingEvents = new Map<string, { timer: NodeJS.Timeout; payload: PendingPayload }>();

function shouldDebounce(event: string) {
  const debounceSeconds = database.appConfig.whatsappDebounceSeconds || 0;
  if (debounceSeconds <= 0) {
    return false;
  }

  if (!event.startsWith('APPOINTMENT_')) {
    return false;
  }

  return !event.startsWith('APPOINTMENT_REMINDER');
}

function scheduleDebouncedSend(payload: PendingPayload, provider: Provider, tenantsRepository: TenantsRepository) {
  const debounceMs = (database.appConfig.whatsappDebounceSeconds || 0) * 1000;
  const key = payload.appointment.id;
  const existing = pendingEvents.get(key);
  if (existing) {
    clearTimeout(existing.timer);
  }

  const timer = setTimeout(() => {
    pendingEvents.delete(key);
    sendNow(payload, provider, tenantsRepository).catch((err: Error) => {
      console.error('Failed to send debounced WhatsApp:', err.message);
    });
  }, debounceMs);

  pendingEvents.set(key, { timer, payload });
}

async function sendNow(
  { event, appointment, recipients }: PendingPayload,
  provider: Provider,
  tenantsRepository: TenantsRepository
) {
  if (!isEventEnabled(event)) {
    return;
  }

  if (isWithinQuietHours(new Date(), database.appConfig.quietHoursStart, database.appConfig.quietHoursEnd)) {
    await logWhatsApp({
      tenantId: appointment.tenantId,
      appointmentId: appointment.id,
      event,
      roleTarget: 'SYSTEM',
      phone: 'N/A',
      message: 'Quiet hours',
      status: 'PENDIENTE',
      error: 'Quiet hours'
    });
    return;
  }

  const template = buildTemplate(event);
  const resolvedTemplate = template || `Evento ${event}`;
  const tenant = await tenantsRepository.findById(appointment.tenantId);
  const tenantName = tenant?.name || 'Barbería';

  for (const recipient of recipients) {
    if (!recipient?.phone || !recipient?.whatsappConsent) {
      continue;
    }

    const message = resolvedTemplate
      .replace('{fecha}', new Date(appointment.startAt).toLocaleString())
      .replace('{estado}', appointment.status || '')
      .replace('{tenant}', tenantName);

    let status: 'ENVIADO' | 'PENDIENTE' | 'FALLIDO' = 'PENDIENTE';
    let error: string | null = null;

    try {
      const result = await provider.send({
        appointmentId: appointment.id,
        tenantId: appointment.tenantId,
        event,
        roleTarget: recipient.role,
        phone: recipient.phone,
        message
      });
      status = result.status;
    } catch (err) {
      status = 'FALLIDO';
      error = err instanceof Error ? err.message : 'Error enviando WhatsApp';
    }

    await logWhatsApp({
      tenantId: appointment.tenantId,
      appointmentId: appointment.id,
      event,
      roleTarget: recipient.role,
      phone: recipient.phone,
      message,
      status,
      error
    });
  }
}

function isEventEnabled(event: string) {
  if (database.appConfig.whatsappEnabledEvents[event] !== undefined) {
    return database.appConfig.whatsappEnabledEvents[event];
  }

  if (event.startsWith('APPOINTMENT_REMINDER')) {
    return database.appConfig.whatsappEnabledEvents.APPOINTMENT_REMINDER !== false;
  }

  return true;
}

function buildTemplate(event: string) {
  if (database.appConfig.whatsappTemplates[event]) {
    return database.appConfig.whatsappTemplates[event];
  }

  if (event.startsWith('APPOINTMENT_REMINDER')) {
    return database.appConfig.whatsappTemplates.APPOINTMENT_REMINDER;
  }

  return undefined;
}

async function logWhatsApp({
  tenantId,
  appointmentId,
  event,
  roleTarget,
  phone,
  message,
  status,
  error
}: {
  tenantId: string;
  appointmentId: string;
  event: string;
  roleTarget: string;
  phone: string;
  message: string;
  status: 'ENVIADO' | 'FALLIDO' | 'PENDIENTE';
  error: string | null;
}) {
  const log = {
    id: `${Date.now()}-${Math.random()}`,
    tenantId,
    appointmentId,
    event,
    roleTarget,
    phone,
    message,
    status,
    error,
    createdAt: new Date().toISOString()
  };

  database.whatsappLogs.push(log);

  if (mongoose.connection.readyState === 1) {
    await WhatsAppLogModel.create({
      tenantId: log.tenantId,
      appointmentId: log.appointmentId,
      event: log.event,
      roleTarget: log.roleTarget,
      phone: log.phone,
      message: log.message,
      status: log.status,
      error: log.error
    });
  }
}

function parseTimeToMinutes(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function isWithinQuietHours(date: Date, startHHmm: string, endHHmm: string) {
  if (!startHHmm || !endHHmm) {
    return false;
  }

  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const start = parseTimeToMinutes(startHHmm);
  const end = parseTimeToMinutes(endHHmm);

  if (start < end) {
    return totalMinutes >= start && totalMinutes < end;
  }

  return totalMinutes >= start || totalMinutes < end;
}
