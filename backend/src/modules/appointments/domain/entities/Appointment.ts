import { AppointmentStatus } from '../value-objects/AppointmentStatus';
import { AppointmentId } from '../value-objects/AppointmentId';
import { StaffId } from '../value-objects/StaffId';
import { ClientId } from '../value-objects/ClientId';
import { ServiceId } from '../value-objects/ServiceId';
import { TimeRange } from '../value-objects/TimeRange';
import {
  CancellationNotAllowedError,
  InvalidAppointmentStateError
} from '../errors/AppointmentErrors';

export class Appointment {
  private status: AppointmentStatus;

  private constructor(
    readonly id: AppointmentId,
    readonly tenantId: string,
    readonly branchId: string,
    readonly staffId: StaffId,
    readonly clientId: ClientId,
    readonly serviceId: ServiceId,
    private timeRange: TimeRange,
    private readonly createdAt: Date,
    status: AppointmentStatus,
    readonly notes?: string | null
  ) {
    this.status = status;
  }

  static schedule(input: {
    id: AppointmentId;
    tenantId: string;
    branchId: string;
    staffId: StaffId;
    clientId: ClientId;
    serviceId: ServiceId;
    timeRange: TimeRange;
    notes?: string | null;
  }) {
    return new Appointment(
      input.id,
      input.tenantId,
      input.branchId,
      input.staffId,
      input.clientId,
      input.serviceId,
      input.timeRange,
      new Date(),
      AppointmentStatus.Pending,
      input.notes
    );
  }

  getStatus() {
    return this.status;
  }

  getStartAt() {
    return this.timeRange.getStartAt();
  }

  getEndAt() {
    return this.timeRange.getEndAt();
  }

  overlapsWith(range: TimeRange) {
    return this.timeRange.overlapsWith(range);
  }

  confirm() {
    this.ensureStatus([AppointmentStatus.Pending]);
    this.status = AppointmentStatus.Confirmed;
  }

  cancel(now: Date) {
    this.ensureStatus([AppointmentStatus.Pending, AppointmentStatus.Confirmed]);

    const minutesUntilStart = this.timeRange.minutesUntilStart(now);
    if (minutesUntilStart < 120) {
      throw new CancellationNotAllowedError(
        'Cancellation not allowed within 2 hours of start time'
      );
    }

    this.status = AppointmentStatus.Cancelled;
  }

  complete() {
    this.ensureStatus([AppointmentStatus.Confirmed]);
    this.status = AppointmentStatus.Completed;
  }

  markNoShow() {
    this.ensureStatus([AppointmentStatus.Confirmed]);
    this.status = AppointmentStatus.NoShow;
  }

  private ensureStatus(allowed: AppointmentStatus[]) {
    if (!allowed.includes(this.status)) {
      throw new InvalidAppointmentStateError(
        `Invalid status transition from ${this.status}`
      );
    }
  }
}
