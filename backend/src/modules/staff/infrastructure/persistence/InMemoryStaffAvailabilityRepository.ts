import { randomUUID } from 'crypto';
import { database } from '../../../../shared/infrastructure/memory/database';
import type { StaffAvailabilityRepository, CreateBlockInput, UpsertScheduleInput } from '../../application/ports/StaffAvailabilityRepository';
import type { StaffBlock, StaffSchedule } from '../../domain/entities/StaffAvailability';

export class InMemoryStaffAvailabilityRepository implements StaffAvailabilityRepository {
  async listSchedules(staffId: string): Promise<StaffSchedule[]> {
    return database.staffSchedules.filter((item) => item.staffId === staffId) as StaffSchedule[];
  }

  async upsertSchedule({ staffId, dayOfWeek, startTime, endTime }: UpsertScheduleInput): Promise<StaffSchedule> {
    const existing = database.staffSchedules.find(
      (item) => item.staffId === staffId && item.dayOfWeek === dayOfWeek
    ) as StaffSchedule | undefined;

    if (existing) {
      existing.startTime = startTime;
      existing.endTime = endTime;
      return existing;
    }

    const schedule: StaffSchedule = { id: randomUUID(), staffId, dayOfWeek, startTime, endTime };
    database.staffSchedules.push(schedule);
    return schedule;
  }

  async addBlock({ staffId, startAt, endAt, reason }: CreateBlockInput): Promise<StaffBlock> {
    const block: StaffBlock = { id: randomUUID(), staffId, startAt, endAt, reason: reason || '' };
    database.staffBlocks.push(block);
    return block;
  }

  async listBlocks(staffId: string): Promise<StaffBlock[]> {
    return database.staffBlocks.filter((item) => item.staffId === staffId) as StaffBlock[];
  }
}
