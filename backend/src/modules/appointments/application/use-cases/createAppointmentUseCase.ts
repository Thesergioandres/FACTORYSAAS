import { AppointmentState } from '../../domain/appointmentStates';
import type { AppointmentsRepository } from '../ports/AppointmentsRepository';
import type { AppointmentRecord } from '../../domain/entities/AppointmentRecord';
import type { AppointmentHistoryRepository } from '../ports/AppointmentHistoryRepository';

type ServiceRecord = {
  durationMinutes: number;
  active: boolean;
};

type UserRecord = {
  id: string;
  role: string;
  phone?: string;
  whatsappConsent?: boolean;
  active?: boolean;
  name?: string;
  email?: string;
};

type ScheduleRecord = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type BlockRecord = {
  startAt: string;
  endAt: string;
};

type ServicesRepository = {
  findById(id: string, tenantId: string): Promise<ServiceRecord | null>;
};

type UsersRepository = {
  list(tenantId: string, role?: string): Promise<UserRecord[]>;
};

type AvailabilityRepository = {
  listSchedules(staffId: string): Promise<ScheduleRecord[]>;
  listBlocks(staffId: string): Promise<BlockRecord[]>;
};

type NotificationsService = {
  emitEvent(input: { event: string; appointment: AppointmentRecord & { tenantId: string }; recipients: UserRecord[] }): Promise<void>;
};

type TenantsRepository = {
  findById(id: string): Promise<{ id: string; config: { bufferTimeMinutes: number; maxNoShowsBeforePayment: number; requirePaymentForNoShows: boolean } } | null>;
};

function buildPaymentLink({ tenantId, clientId }: { tenantId: string; clientId: string }) {
  return `https://pay.essence.com/checkout?tenantId=${tenantId}&clientId=${clientId}`;
}

export class CreateAppointmentUseCase {
  constructor(
    private readonly deps: {
      appointmentsRepository: AppointmentsRepository;
      servicesRepository: ServicesRepository;
      availabilityRepository: AvailabilityRepository;
      usersRepository: UsersRepository;
      notificationsService: NotificationsService;
      historyRepository: AppointmentHistoryRepository;
      tenantsRepository: TenantsRepository;
      config: { minAdvanceMinutes: number };
    }
  ) {}

  async execute({ tenantId, branchId, clientId, staffId, serviceId, startAt, notes, actorRole, actorUserId }: {
    tenantId: string;
    branchId: string;
    clientId?: string;
    staffId?: string;
    serviceId?: string;
    startAt?: string;
    notes?: string;
    actorRole?: string;
    actorUserId?: string;
  }): Promise<{ appointment: AppointmentRecord } | { error: string; statusCode: number; paymentUrl?: string }> {
    if (!tenantId || !branchId || !clientId || !staffId || !serviceId || !startAt) {
      return { error: 'tenantId, branchId, clientId, staffId, serviceId y startAt son requeridos', statusCode: 400 };
    }

    const service = await this.deps.servicesRepository.findById(serviceId, tenantId);
    if (!service || !service.active) {
      return { error: 'Servicio no disponible', statusCode: 400 };
    }

    const users = await this.deps.usersRepository.list(tenantId);
    const client = users.find((user) => user.id === clientId);
    const staff = users.find((user) => user.id === staffId);
    if (!client || !staff) {
      return { error: 'Cliente o staff invalido', statusCode: 404 };
    }

    const startDate = new Date(startAt);
    const now = new Date();
    const minStart = new Date(now.getTime() + this.deps.config.minAdvanceMinutes * 60 * 1000);
    if (startDate < minStart) {
      return { error: `Debe reservar con al menos ${this.deps.config.minAdvanceMinutes} minutos de anticipación`, statusCode: 400 };
    }

    const tenant = await this.deps.tenantsRepository.findById(tenantId);
    if (!tenant) {
      return { error: 'Tenant inválido', statusCode: 404 };
    }

    const noShowLimit = Number(tenant.config.maxNoShowsBeforePayment || 0);
    if (noShowLimit > 0) {
      const clientAppointments = await this.deps.appointmentsRepository.list(tenantId, { clientId });
      const noShowCount = clientAppointments.filter((item) => item.status === AppointmentState.NO_ASISTIO).length;

      if (noShowCount >= noShowLimit) {
        return {
          error: 'Requiere pago previo para reservar nuevas citas',
          statusCode: 402,
          paymentUrl: buildPaymentLink({ tenantId, clientId })
        };
      }
    }

    const bufferTimeMinutes = tenant.config.bufferTimeMinutes || 0;
    const endDate = new Date(startDate.getTime() + (service.durationMinutes + bufferTimeMinutes) * 60 * 1000);

    const schedules = await this.deps.availabilityRepository.listSchedules(staffId);
    if (schedules.length > 0) {
      const day = startDate.getDay();
      const schedule = schedules.find((item) => item.dayOfWeek === day);
      if (!schedule) {
        return { error: 'Staff no disponible para ese dia', statusCode: 400 };
      }

      const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
      const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
      const [sh, sm] = schedule.startTime.split(':').map(Number);
      const [eh, em] = schedule.endTime.split(':').map(Number);
      const scheduleStart = sh * 60 + sm;
      const scheduleEnd = eh * 60 + em;

      if (startMinutes < scheduleStart || endMinutes > scheduleEnd) {
        return { error: 'Cita fuera del horario del staff', statusCode: 400 };
      }
    }

    const blocks = await this.deps.availabilityRepository.listBlocks(staffId);
    const hasBlockConflict = blocks.some((block) => {
      const blockStart = new Date(block.startAt);
      const blockEnd = new Date(block.endAt);
      return startDate < blockEnd && endDate > blockStart;
    });

    if (hasBlockConflict) {
      return { error: 'Horario bloqueado por el staff', statusCode: 409 };
    }

    const overlaps = await this.deps.appointmentsRepository.findByStaffInRange(tenantId, staffId, startDate, endDate);
    if (overlaps.length > 0) {
      return { error: 'El staff ya tiene cita en ese rango', statusCode: 409 };
    }

    const clientOverlaps = await this.deps.appointmentsRepository.findByClientInRange(tenantId, clientId, startDate, endDate);
    if (clientOverlaps.length > 0) {
      return { error: 'El cliente ya tiene una cita en ese rango', statusCode: 409 };
    }

    const appointment = await this.deps.appointmentsRepository.create({
      tenantId,
      branchId,
      clientId,
      staffId,
      serviceId,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      status: AppointmentState.PENDIENTE,
      notes: notes || ''
    });

    await this.deps.historyRepository.create({
      appointmentId: appointment.id,
      actorRole: actorRole || 'CLIENT',
      actorUserId: actorUserId || clientId,
      action: 'CREATED',
      nextStatus: appointment.status,
      nextStartAt: appointment.startAt,
      nextEndAt: appointment.endAt,
      nextStaffId: appointment.staffId
    });

    await this.deps.notificationsService.emitEvent({
      event: 'APPOINTMENT_CREATED',
      appointment,
      recipients: [client, staff]
    });

    return { appointment };
  }
}
