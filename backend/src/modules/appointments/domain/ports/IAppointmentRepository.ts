import { Appointment } from '../entities/Appointment';
import { StaffId } from '../value-objects/StaffId';
import { TimeRange } from '../value-objects/TimeRange';

export interface IAppointmentRepository {
  existsOverlapping(staffId: StaffId, timeRange: TimeRange): Promise<boolean>;
  save(appointment: Appointment): Promise<void>;
}
