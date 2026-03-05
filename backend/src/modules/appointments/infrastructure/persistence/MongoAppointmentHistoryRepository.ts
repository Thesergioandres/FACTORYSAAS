import { AppointmentHistoryModel } from '../../../../shared/infrastructure/mongoose/models/AppointmentHistoryModel';
import type { AppointmentHistoryRepository, CreateAppointmentHistoryInput } from '../../application/ports/AppointmentHistoryRepository';
import type { AppointmentHistoryRecord } from '../../domain/entities/AppointmentHistoryRecord';

function mapHistory(document: {
  _id: { toString(): string };
  appointmentId: string;
  actorRole: string;
  actorUserId: string;
  action: string;
  prevStatus?: string | null;
  nextStatus?: string | null;
  prevStartAt?: Date | null;
  nextStartAt?: Date | null;
  prevEndAt?: Date | null;
  nextEndAt?: Date | null;
  prevStaffId?: string | null;
  nextStaffId?: string | null;
  createdAt?: Date;
} | null): AppointmentHistoryRecord | null {
  if (!document) {
    return null;
  }

  return {
    id: document._id.toString(),
    appointmentId: document.appointmentId,
    actorRole: document.actorRole,
    actorUserId: document.actorUserId,
    action: document.action as AppointmentHistoryRecord['action'],
    prevStatus: document.prevStatus ?? undefined,
    nextStatus: document.nextStatus ?? undefined,
    prevStartAt: document.prevStartAt ? new Date(document.prevStartAt).toISOString() : undefined,
    nextStartAt: document.nextStartAt ? new Date(document.nextStartAt).toISOString() : undefined,
    prevEndAt: document.prevEndAt ? new Date(document.prevEndAt).toISOString() : undefined,
    nextEndAt: document.nextEndAt ? new Date(document.nextEndAt).toISOString() : undefined,
    prevStaffId: document.prevStaffId ?? undefined,
    nextStaffId: document.nextStaffId ?? undefined,
    createdAt: document.createdAt ? new Date(document.createdAt).toISOString() : new Date().toISOString()
  };
}

export class MongoAppointmentHistoryRepository implements AppointmentHistoryRepository {
  async listByAppointment(appointmentId: string): Promise<AppointmentHistoryRecord[]> {
    const docs = await AppointmentHistoryModel.find({ appointmentId }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => mapHistory(doc as typeof doc & { _id: { toString(): string } }) as AppointmentHistoryRecord);
  }

  async create(input: CreateAppointmentHistoryInput): Promise<AppointmentHistoryRecord> {
    const doc = await AppointmentHistoryModel.create({
      appointmentId: input.appointmentId,
      actorRole: input.actorRole,
      actorUserId: input.actorUserId,
      action: input.action,
      prevStatus: input.prevStatus ?? null,
      nextStatus: input.nextStatus ?? null,
      prevStartAt: input.prevStartAt ? new Date(input.prevStartAt) : null,
      nextStartAt: input.nextStartAt ? new Date(input.nextStartAt) : null,
      prevEndAt: input.prevEndAt ? new Date(input.prevEndAt) : null,
      nextEndAt: input.nextEndAt ? new Date(input.nextEndAt) : null,
      prevStaffId: input.prevStaffId ?? null,
      nextStaffId: input.nextStaffId ?? null
    });

    return mapHistory(doc.toObject() as typeof doc & { _id: { toString(): string } }) as AppointmentHistoryRecord;
  }
}
