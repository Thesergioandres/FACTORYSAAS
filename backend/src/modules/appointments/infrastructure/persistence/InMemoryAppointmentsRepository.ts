import { randomUUID } from 'crypto';
import { database } from '../../../../shared/infrastructure/memory/database';
import type { AppointmentsRepository, CreateAppointmentInput, UpdateAppointmentInput } from '../../application/ports/AppointmentsRepository';
import type { AppointmentRecord } from '../../domain/entities/AppointmentRecord';

export class InMemoryAppointmentsRepository implements AppointmentsRepository {
  async list(tenantId: string, filters: { clientId?: string; staffId?: string; startFrom?: Date; startTo?: Date } = {}): Promise<AppointmentRecord[]> {
    let results = database.appointments.filter(a => a.tenantId === tenantId);

    if (filters.clientId) {
      results = results.filter((appointment) => appointment.clientId === filters.clientId);
    }

    if (filters.staffId) {
      results = results.filter((appointment) => appointment.staffId === filters.staffId);
    }

    if (filters.startFrom || filters.startTo) {
      const from = filters.startFrom?.getTime();
      const to = filters.startTo?.getTime();
      results = results.filter((appointment) => {
        const start = new Date(appointment.startAt).getTime();
        if (from !== undefined && start < from) return false;
        if (to !== undefined && start > to) return false;
        return true;
      });
    }

    return results;
  }

  async findById(id: string, tenantId: string): Promise<AppointmentRecord | null> {
    const app = database.appointments.find((appointment) => appointment.id === id);
    return app?.tenantId === tenantId ? app : null;
  }

  async findByStaffInRange(tenantId: string, staffId: string, startAt: Date, endAt: Date, excludeId?: string): Promise<AppointmentRecord[]> {
    return database.appointments.filter((appointment) => {
      if (appointment.tenantId !== tenantId || appointment.staffId !== staffId) {
        return false;
      }

      if (appointment.status === 'CANCELADA') {
        return false;
      }

      if (excludeId && appointment.id === excludeId) {
        return false;
      }

      const appointmentStart = new Date(appointment.startAt);
      const appointmentEnd = new Date(appointment.endAt);
      return appointmentStart < endAt && appointmentEnd > startAt;
    });
  }

  async findByClientInRange(tenantId: string, clientId: string, startAt: Date, endAt: Date, excludeId?: string): Promise<AppointmentRecord[]> {
    return database.appointments.filter((appointment) => {
      if (appointment.tenantId !== tenantId || appointment.clientId !== clientId) {
        return false;
      }

      if (appointment.status === 'CANCELADA') {
        return false;
      }

      if (excludeId && appointment.id === excludeId) {
        return false;
      }

      const appointmentStart = new Date(appointment.startAt);
      const appointmentEnd = new Date(appointment.endAt);
      return appointmentStart < endAt && appointmentEnd > startAt;
    });
  }

  async create(payload: CreateAppointmentInput): Promise<AppointmentRecord> {
    const appointment: AppointmentRecord = {
      id: randomUUID(),
      tenantId: payload.tenantId,
      branchId: payload.branchId,
      clientId: payload.clientId,
      staffId: payload.staffId,
      serviceId: payload.serviceId,
      startAt: payload.startAt,
      endAt: payload.endAt,
      status: payload.status,
      notes: payload.notes,
      createdAt: new Date().toISOString()
    };

    database.appointments.push(appointment);
    return appointment;
  }

  async update(id: string, partial: UpdateAppointmentInput): Promise<AppointmentRecord | null> {
    const appointment = database.appointments.find((appointment) => appointment.id === id);
    if (!appointment) {
      return null;
    }

    if (partial.clientId !== undefined) appointment.clientId = partial.clientId;
    if (partial.staffId !== undefined) appointment.staffId = partial.staffId;
    if (partial.serviceId !== undefined) appointment.serviceId = partial.serviceId;
    if (partial.startAt !== undefined) appointment.startAt = String(partial.startAt);
    if (partial.endAt !== undefined) appointment.endAt = String(partial.endAt);
    if (partial.status !== undefined) appointment.status = partial.status;
    if (partial.notes !== undefined) appointment.notes = partial.notes;

    return appointment;
  }
}
