import { randomUUID } from 'crypto';
import { database } from '../../../../shared/infrastructure/memory/database';
import type { AppointmentHistoryRepository, CreateAppointmentHistoryInput } from '../../application/ports/AppointmentHistoryRepository';
import type { AppointmentHistoryRecord } from '../../domain/entities/AppointmentHistoryRecord';

export class InMemoryAppointmentHistoryRepository implements AppointmentHistoryRepository {
  async listByAppointment(appointmentId: string): Promise<AppointmentHistoryRecord[]> {
    return (database.appointmentHistory as unknown as AppointmentHistoryRecord[])
      .filter((entry) => entry.appointmentId === appointmentId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async create(input: CreateAppointmentHistoryInput): Promise<AppointmentHistoryRecord> {
    const record: AppointmentHistoryRecord = {
      id: randomUUID(),
      appointmentId: input.appointmentId,
      actorRole: input.actorRole,
      actorUserId: input.actorUserId,
      action: input.action,
      prevStatus: input.prevStatus,
      nextStatus: input.nextStatus,
      prevStartAt: input.prevStartAt,
      nextStartAt: input.nextStartAt,
      prevEndAt: input.prevEndAt,
      nextEndAt: input.nextEndAt,
      prevStaffId: input.prevStaffId,
      nextStaffId: input.nextStaffId,
      createdAt: new Date().toISOString()
    };

    database.appointmentHistory.push(record);
    return record;
  }
}
