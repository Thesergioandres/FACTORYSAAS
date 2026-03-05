import type { AppointmentRecord, AppointmentStatus } from '../../domain/entities/AppointmentRecord';

export type CreateAppointmentInput = {
  tenantId: string;
  branchId: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes: string;
};

export type UpdateAppointmentInput = Partial<CreateAppointmentInput> & {
  status?: AppointmentStatus;
};

export interface AppointmentsRepository {
  list(tenantId: string, filters?: { clientId?: string; staffId?: string; startFrom?: Date; startTo?: Date }): Promise<AppointmentRecord[]>;
  findById(id: string, tenantId: string): Promise<AppointmentRecord | null>;
  findByStaffInRange(tenantId: string, staffId: string, startAt: Date, endAt: Date, excludeId?: string): Promise<AppointmentRecord[]>;
  findByClientInRange(tenantId: string, clientId: string, startAt: Date, endAt: Date, excludeId?: string): Promise<AppointmentRecord[]>;
  create(input: CreateAppointmentInput): Promise<AppointmentRecord>;
  update(id: string, input: UpdateAppointmentInput): Promise<AppointmentRecord | null>;
}
