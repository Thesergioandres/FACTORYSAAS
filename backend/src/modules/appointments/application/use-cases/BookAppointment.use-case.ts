import { Appointment } from '../../domain/entities/Appointment';
import { OverlappingAppointmentError } from '../../domain/errors/AppointmentErrors';
import { IAppointmentRepository } from '../../domain/ports/IAppointmentRepository';
import { IWhatsAppService } from '../../domain/ports/IWhatsAppService';
import { AppointmentId } from '../../domain/value-objects/AppointmentId';
import { StaffId } from '../../domain/value-objects/StaffId';
import { ClientId } from '../../domain/value-objects/ClientId';
import { ServiceId } from '../../domain/value-objects/ServiceId';
import { TimeRange } from '../../domain/value-objects/TimeRange';

export interface BookAppointmentInput {
  tenantId: string;
  branchId: string;
  appointmentId: string;
  staffId: string;
  clientId: string;
  serviceId: string;
  startAt: Date;
  durationMinutes: number;
  notes?: string | null;
  notifyWhatsapp?: boolean;
  clientPhone?: string;
  staffPhone?: string;
}

export class BookAppointmentUseCase {
  constructor(
    private readonly repository: IAppointmentRepository,
    private readonly whatsappService: IWhatsAppService
  ) {}

  async execute(input: BookAppointmentInput) {
    if (input.durationMinutes <= 0) {
      throw new Error('Duration must be greater than zero');
    }

    const startAt = new Date(input.startAt);
    const endAt = addMinutes(startAt, input.durationMinutes);
    const timeRange = new TimeRange(startAt, endAt);

    const staffId = new StaffId(input.staffId);

    const isOverlapping = await this.repository.existsOverlapping(
      staffId,
      timeRange
    );

    if (isOverlapping) {
      throw new OverlappingAppointmentError(
        'Staff already has an appointment in the selected time range'
      );
    }

    const appointment = Appointment.schedule({
      id: new AppointmentId(input.appointmentId),
      tenantId: input.tenantId,
      branchId: input.branchId,
      staffId,
      clientId: new ClientId(input.clientId),
      serviceId: new ServiceId(input.serviceId),
      timeRange,
      notes: input.notes
    });

    await this.repository.save(appointment);

    if (input.notifyWhatsapp && input.clientPhone && input.staffPhone) {
      await this.whatsappService.sendAppointmentCreated({
        appointmentId: appointment.id,
        staffId,
        serviceId: new ServiceId(input.serviceId),
        clientPhone: input.clientPhone,
        staffPhone: input.staffPhone,
        startAt: appointment.getStartAt()
      });
    }

    return appointment;
  }
}

function addMinutes(startAt: Date, minutes: number) {
  return new Date(startAt.getTime() + minutes * 60000);
}
