import { AppointmentModel } from '../../../../shared/infrastructure/mongoose/models/AppointmentModel';
import type { AppointmentsRepository, CreateAppointmentInput, UpdateAppointmentInput } from '../../application/ports/AppointmentsRepository';
import type { AppointmentRecord, AppointmentStatus } from '../../domain/entities/AppointmentRecord';

function mapAppointment(document: {
  _id: { toString(): string };
  tenantId: string;
  branchId: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  startAt: Date;
  endAt: Date;
  status: string;
  notes?: string;
  createdAt?: Date;
} | null): AppointmentRecord | null {
  if (!document) {
    return null;
  }

  return {
    id: document._id.toString(),
    tenantId: document.tenantId,
    branchId: document.branchId,
    clientId: document.clientId,
    staffId: document.staffId,
    serviceId: document.serviceId,
    startAt: new Date(document.startAt).toISOString(),
    endAt: new Date(document.endAt).toISOString(),
    status: document.status as AppointmentStatus,
    notes: document.notes || '',
    createdAt: document.createdAt ? new Date(document.createdAt).toISOString() : new Date().toISOString()
  };
}

export class MongoAppointmentsRepository implements AppointmentsRepository {
  async list(tenantId: string, filters: { clientId?: string; staffId?: string; startFrom?: Date; startTo?: Date } = {}): Promise<AppointmentRecord[]> {
    const query: Record<string, unknown> = { tenantId };
    if (filters.clientId) query.clientId = filters.clientId;
    if (filters.staffId) query.staffId = filters.staffId;
    if (filters.startFrom || filters.startTo) {
      query.startAt = {};
      if (filters.startFrom) (query.startAt as Record<string, unknown>).$gte = filters.startFrom;
      if (filters.startTo) (query.startAt as Record<string, unknown>).$lte = filters.startTo;
    }

    const docs = await AppointmentModel.find(query).sort({ startAt: 1 }).lean();
    return docs.map((doc) => mapAppointment(doc as typeof doc & { _id: { toString(): string } }) as AppointmentRecord);
  }

  async findById(id: string, tenantId: string): Promise<AppointmentRecord | null> {
    const doc = await AppointmentModel.findOne({ _id: id, tenantId }).lean();
    return mapAppointment(doc as typeof doc & { _id: { toString(): string } });
  }

  async findByStaffInRange(tenantId: string, staffId: string, startAt: Date, endAt: Date, excludeId?: string): Promise<AppointmentRecord[]> {
    const query: Record<string, unknown> = {
      tenantId,
      staffId,
      status: { $ne: 'CANCELADA' },
      startAt: { $lt: endAt },
      endAt: { $gt: startAt }
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const docs = await AppointmentModel.find(query).lean();
    return docs.map((doc) => mapAppointment(doc as typeof doc & { _id: { toString(): string } }) as AppointmentRecord);
  }

  async findByClientInRange(tenantId: string, clientId: string, startAt: Date, endAt: Date, excludeId?: string): Promise<AppointmentRecord[]> {
    const query: Record<string, unknown> = {
      tenantId,
      clientId,
      status: { $ne: 'CANCELADA' },
      startAt: { $lt: endAt },
      endAt: { $gt: startAt }
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const docs = await AppointmentModel.find(query).lean();
    return docs.map((doc) => mapAppointment(doc as typeof doc & { _id: { toString(): string } }) as AppointmentRecord);
  }

  async create(payload: CreateAppointmentInput): Promise<AppointmentRecord> {
    const doc = await AppointmentModel.create({
      tenantId: payload.tenantId,
      branchId: payload.branchId,
      clientId: payload.clientId,
      staffId: payload.staffId,
      serviceId: payload.serviceId,
      startAt: new Date(payload.startAt),
      endAt: new Date(payload.endAt),
      status: payload.status,
      notes: payload.notes || ''
    });

    return mapAppointment(doc.toObject() as typeof doc & { _id: { toString(): string } }) as AppointmentRecord;
  }

  async update(id: string, partial: UpdateAppointmentInput): Promise<AppointmentRecord | null> {
    const update: Record<string, unknown> = { ...partial };
    if (update.startAt) update.startAt = new Date(String(update.startAt));
    if (update.endAt) update.endAt = new Date(String(update.endAt));

    const doc = await AppointmentModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return mapAppointment(doc as typeof doc & { _id: { toString(): string } });
  }
}
