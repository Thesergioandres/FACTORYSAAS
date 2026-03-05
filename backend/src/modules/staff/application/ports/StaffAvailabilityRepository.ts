import type { StaffBlock, StaffSchedule } from '../../domain/entities/StaffAvailability';

export type UpsertScheduleInput = {
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type CreateBlockInput = {
  staffId: string;
  startAt: string;
  endAt: string;
  reason?: string;
};

export interface StaffAvailabilityRepository {
  listSchedules(staffId: string): Promise<StaffSchedule[]>;
  upsertSchedule(input: UpsertScheduleInput): Promise<StaffSchedule>;
  addBlock(input: CreateBlockInput): Promise<StaffBlock>;
  listBlocks(staffId: string): Promise<StaffBlock[]>;
}
