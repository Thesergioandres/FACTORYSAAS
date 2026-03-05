import type { AppointmentHistoryRecord, AppointmentHistoryAction } from '../../domain/entities/AppointmentHistoryRecord';

export type CreateAppointmentHistoryInput = {
  appointmentId: string;
  actorRole: string;
  actorUserId: string;
  action: AppointmentHistoryAction;
  prevStatus?: string;
  nextStatus?: string;
  prevStartAt?: string;
  nextStartAt?: string;
  prevEndAt?: string;
  nextEndAt?: string;
  prevStaffId?: string;
  nextStaffId?: string;
};

export interface AppointmentHistoryRepository {
  listByAppointment(appointmentId: string): Promise<AppointmentHistoryRecord[]>;
  create(input: CreateAppointmentHistoryInput): Promise<AppointmentHistoryRecord>;
}
