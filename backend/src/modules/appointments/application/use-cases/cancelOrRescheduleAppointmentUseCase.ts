import type { AppointmentsRepository } from '../ports/AppointmentsRepository';
import type { AppointmentRecord } from '../../domain/entities/AppointmentRecord';
import type { AppointmentHistoryRepository } from '../ports/AppointmentHistoryRepository';

type UserRecord = {
  id: string;
  role: string;
  phone?: string;
  whatsappConsent?: boolean;
};

type ServicesRepository = {
  findById(id: string, tenantId: string): Promise<{ durationMinutes: number } | null>;
};

type UsersRepository = {
  list(tenantId: string): Promise<UserRecord[]>;
};

type NotificationsService = {
  emitEvent(input: { event: string; appointment: AppointmentRecord & { tenantId: string }; recipients: UserRecord[] }): Promise<void>;
};

type TenantsRepository = {
  findById(id: string): Promise<{ id: string; config: { bufferTimeMinutes: number } } | null>;
};

export class CancelOrRescheduleAppointmentUseCase {
  constructor(
    private readonly deps: {
      appointmentsRepository: AppointmentsRepository;
      servicesRepository: ServicesRepository;
      usersRepository: UsersRepository;
      notificationsService: NotificationsService;
      historyRepository: AppointmentHistoryRepository;
      tenantsRepository: TenantsRepository;
      config: { cancelLimitMinutes: number; rescheduleLimitMinutes: number };
    }
  ) {}

  async cancel({ tenantId, appointmentId, actorRole, actorUserId }: { tenantId: string; appointmentId: string; actorRole: string; actorUserId: string }): Promise<{ appointment: AppointmentRecord } | { error: string; statusCode: number }> {
    const appointment = await this.deps.appointmentsRepository.findById(appointmentId, tenantId);
    if (!appointment) {
      return { error: 'Cita no encontrada', statusCode: 404 };
    }

    if (actorRole === 'CLIENT' && appointment.clientId !== actorUserId) {
      return { error: 'No puedes cancelar una cita de otro cliente', statusCode: 403 };
    }

    if (!['PENDIENTE', 'CONFIRMADA'].includes(appointment.status)) {
      return { error: 'Solo se pueden cancelar citas pendientes o confirmadas', statusCode: 400 };
    }

    const minutesToStart = Math.floor((new Date(appointment.startAt).getTime() - Date.now()) / 60000);
    if (actorRole !== 'ADMIN' && minutesToStart < this.deps.config.cancelLimitMinutes) {
      return { error: `Cancelación permitida hasta ${this.deps.config.cancelLimitMinutes} minutos antes`, statusCode: 403 };
    }

    const previousStatus = appointment.status;
    appointment.status = 'CANCELADA';
    await this.deps.appointmentsRepository.update(appointmentId, { status: 'CANCELADA' });

    await this.deps.historyRepository.create({
      appointmentId: appointment.id,
      actorRole,
      actorUserId,
      action: 'CANCELLED',
      prevStatus: previousStatus,
      nextStatus: 'CANCELADA'
    });

    const users = await this.deps.usersRepository.list(tenantId);
    const client = users.find((item) => item.id === appointment.clientId);
    const staff = users.find((item) => item.id === appointment.staffId);

    await this.deps.notificationsService.emitEvent({
      event: 'APPOINTMENT_CANCELLED',
      appointment,
      recipients: [client, staff].filter(Boolean) as UserRecord[]
    });

    return { appointment };
  }

  async reschedule({
    tenantId,
    appointmentId,
    actorRole,
    actorUserId,
    startAt
  }: {
    tenantId: string;
    appointmentId: string;
    actorRole: string;
    actorUserId: string;
    startAt: string;
  }): Promise<{ appointment: AppointmentRecord } | { error: string; statusCode: number }> {
    const appointment = await this.deps.appointmentsRepository.findById(appointmentId, tenantId);
    if (!appointment) {
      return { error: 'Cita no encontrada', statusCode: 404 };
    }

    if (actorRole === 'CLIENT' && appointment.clientId !== actorUserId) {
      return { error: 'No puedes reprogramar una cita de otro cliente', statusCode: 403 };
    }

    if (!['PENDIENTE', 'CONFIRMADA'].includes(appointment.status)) {
      return { error: 'Solo se pueden reprogramar citas pendientes o confirmadas', statusCode: 400 };
    }

    const minutesToStart = Math.floor((new Date(appointment.startAt).getTime() - Date.now()) / 60000);
    if (actorRole !== 'ADMIN' && minutesToStart < this.deps.config.rescheduleLimitMinutes) {
      return { error: `Reprogramación permitida hasta ${this.deps.config.rescheduleLimitMinutes} minutos antes`, statusCode: 403 };
    }

    const service = await this.deps.servicesRepository.findById(appointment.serviceId, tenantId);
    if (!service) {
      return { error: 'Servicio no encontrado', statusCode: 404 };
    }

    const tenant = await this.deps.tenantsRepository.findById(tenantId);
    if (!tenant) {
      return { error: 'Tenant inválido', statusCode: 404 };
    }

    const nextStart = new Date(startAt);
    const bufferTimeMinutes = tenant.config.bufferTimeMinutes || 0;
    const nextEnd = new Date(nextStart.getTime() + (service.durationMinutes + bufferTimeMinutes) * 60 * 1000);

    const overlaps = await this.deps.appointmentsRepository.findByStaffInRange(
      tenantId,
      appointment.staffId,
      nextStart,
      nextEnd,
      appointment.id
    );
    if (overlaps.length > 0) {
      return { error: 'El staff ya tiene una cita en ese nuevo rango', statusCode: 409 };
    }

    const clientOverlaps = await this.deps.appointmentsRepository.findByClientInRange(
      tenantId,
      appointment.clientId,
      nextStart,
      nextEnd,
      appointment.id
    );
    if (clientOverlaps.length > 0) {
      return { error: 'El cliente ya tiene una cita en ese nuevo rango', statusCode: 409 };
    }

    const previousStartAt = appointment.startAt;
    const previousEndAt = appointment.endAt;

    appointment.startAt = nextStart.toISOString();
    appointment.endAt = nextEnd.toISOString();
    await this.deps.appointmentsRepository.update(appointment.id, {
      startAt: appointment.startAt,
      endAt: appointment.endAt
    });

    await this.deps.historyRepository.create({
      appointmentId: appointment.id,
      actorRole,
      actorUserId,
      action: 'RESCHEDULED',
      prevStartAt: previousStartAt,
      nextStartAt: nextStart.toISOString(),
      prevEndAt: previousEndAt,
      nextEndAt: nextEnd.toISOString()
    });

    const users = await this.deps.usersRepository.list(tenantId);
    const client = users.find((item) => item.id === appointment.clientId);
    const staff = users.find((item) => item.id === appointment.staffId);

    await this.deps.notificationsService.emitEvent({
      event: 'APPOINTMENT_RESCHEDULED',
      appointment,
      recipients: [client, staff].filter(Boolean) as UserRecord[]
    });

    return { appointment };
  }
}
