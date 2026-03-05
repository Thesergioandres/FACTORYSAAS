import { AppointmentState } from '../../domain/appointmentStates';
import { canTransition } from '../../domain/appointmentRules';
import type { AppointmentsRepository } from '../ports/AppointmentsRepository';
import type { AppointmentRecord, AppointmentStatus } from '../../domain/entities/AppointmentRecord';
import type { AppointmentHistoryRepository } from '../ports/AppointmentHistoryRepository';

type UserRecord = {
  id: string;
  role: string;
  phone?: string;
  whatsappConsent?: boolean;
};

type UsersRepository = {
  list(tenantId: string): Promise<UserRecord[]>;
};

type NotificationsService = {
  emitEvent(input: { event: string; appointment: AppointmentRecord & { tenantId: string }; recipients: UserRecord[] }): Promise<void>;
};

export class UpdateAppointmentStatusUseCase {
  constructor(
    private readonly deps: {
      appointmentsRepository: AppointmentsRepository;
      usersRepository: UsersRepository;
      notificationsService: NotificationsService;
      historyRepository: AppointmentHistoryRepository;
    }
  ) {}

  async execute({ tenantId, appointmentId, nextStatus, actorRole, actorUserId }: {
    tenantId: string;
    appointmentId?: string;
    nextStatus?: string;
    actorRole?: string;
    actorUserId?: string;
  }): Promise<{ appointment: AppointmentRecord } | { error: string; statusCode: number }> {
    if (!tenantId || !appointmentId || !nextStatus) {
      return { error: 'tenantId, appointmentId y nextStatus son requeridos', statusCode: 400 };
    }

    if (!Object.values(AppointmentState).includes(nextStatus as AppointmentState)) {
      return { error: 'Estado inválido', statusCode: 400 };
    }

    const normalizedStatus = nextStatus as AppointmentStatus;

    const appointment = await this.deps.appointmentsRepository.findById(appointmentId, tenantId);
    if (!appointment) {
      return { error: 'Cita no encontrada', statusCode: 404 };
    }

    if (actorRole === 'STAFF' && appointment.staffId !== actorUserId) {
      return { error: 'No puedes modificar una cita de otro staff', statusCode: 403 };
    }

    if (!canTransition(appointment.status, normalizedStatus)) {
      return { error: `No se puede cambiar de ${appointment.status} a ${normalizedStatus}`, statusCode: 400 };
    }

    const previousStatus = appointment.status;

    appointment.status = normalizedStatus;
    await this.deps.appointmentsRepository.update(appointmentId, { status: normalizedStatus });

    await this.deps.historyRepository.create({
      appointmentId: appointment.id,
      actorRole: actorRole || 'SYSTEM',
      actorUserId: actorUserId || 'SYSTEM',
      action: 'STATUS_UPDATED',
      prevStatus: previousStatus,
      nextStatus: normalizedStatus
    });

    const users = await this.deps.usersRepository.list(tenantId);
    const client = users.find((item) => item.id === appointment.clientId);
    const staff = users.find((item) => item.id === appointment.staffId);

    await this.deps.notificationsService.emitEvent({
      event: normalizedStatus === AppointmentState.CONFIRMADA ? 'APPOINTMENT_CONFIRMED' : 'APPOINTMENT_UPDATED',
      appointment,
      recipients: [client, staff].filter(Boolean) as UserRecord[]
    });

    return { appointment };
  }
}
