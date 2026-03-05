import type { Appointment } from '../entities/Appointment';

export type CreateAppointmentInput = {
  branchId: string;
  staffId: string;
  serviceId: string;
  startAt: string;
  notes?: string;
};

export interface AppointmentsRepository {
  listMine(): Promise<Appointment[]>;
  create(input: CreateAppointmentInput): Promise<Appointment>;
}
