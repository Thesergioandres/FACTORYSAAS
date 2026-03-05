import { AppointmentId } from '../value-objects/AppointmentId';
import { StaffId } from '../value-objects/StaffId';
import { ServiceId } from '../value-objects/ServiceId';

export interface IWhatsAppService {
  sendAppointmentCreated(input: {
    appointmentId: AppointmentId;
    staffId: StaffId;
    serviceId: ServiceId;
    clientPhone: string;
    staffPhone: string;
    startAt: Date;
  }): Promise<void>;
}
