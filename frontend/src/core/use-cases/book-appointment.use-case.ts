import { Appointment } from '../domain/models/Appointment';

export interface BookAppointmentInput {
  serviceId: string;
  staffId: string;
  clientId: string;
  startAt: string;
}

export interface BookAppointmentUseCase {
  execute(input: BookAppointmentInput): Promise<Appointment>;
}
