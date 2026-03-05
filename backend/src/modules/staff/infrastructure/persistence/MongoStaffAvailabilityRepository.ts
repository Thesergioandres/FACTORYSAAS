import { StaffScheduleModel, StaffBlockModel } from '../../../../shared/infrastructure/mongoose/models/StaffAvailabilityModels.js';
import type { StaffAvailabilityRepository, CreateBlockInput, UpsertScheduleInput } from '../../application/ports/StaffAvailabilityRepository';
import type { StaffBlock, StaffSchedule } from '../../domain/entities/StaffAvailability';

function mapSchedule(document: {
  _id: { toString(): string };
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}): StaffSchedule {
  return {
    id: document._id.toString(),
    staffId: document.staffId,
    dayOfWeek: document.dayOfWeek,
    startTime: document.startTime,
    endTime: document.endTime
  };
}

function mapBlock(document: {
  _id: { toString(): string };
  staffId: string;
  startAt: Date;
  endAt: Date;
  reason?: string;
}): StaffBlock {
  return {
    id: document._id.toString(),
    staffId: document.staffId,
    startAt: new Date(document.startAt).toISOString(),
    endAt: new Date(document.endAt).toISOString(),
    reason: document.reason || ''
  };
}

export class MongoStaffAvailabilityRepository implements StaffAvailabilityRepository {
  async listSchedules(staffId: string): Promise<StaffSchedule[]> {
    const docs = await StaffScheduleModel.find({ staffId }).lean() as Array<{
      _id: { toString(): string };
      staffId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>;
    return docs.map((doc) => mapSchedule(doc));
  }

  async upsertSchedule({ staffId, dayOfWeek, startTime, endTime }: UpsertScheduleInput): Promise<StaffSchedule> {
    const doc = await StaffScheduleModel.findOneAndUpdate(
      { staffId, dayOfWeek },
      { staffId, dayOfWeek, startTime, endTime },
      { upsert: true, new: true }
    ).lean();

    return mapSchedule(doc as typeof doc & { _id: { toString(): string } });
  }

  async addBlock({ staffId, startAt, endAt, reason }: CreateBlockInput): Promise<StaffBlock> {
    const doc = await StaffBlockModel.create({
      staffId,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      reason: reason || ''
    });

    return mapBlock(doc.toObject() as typeof doc & { _id: { toString(): string } });
  }

  async listBlocks(staffId: string): Promise<StaffBlock[]> {
    const docs = await StaffBlockModel.find({ staffId }).lean() as Array<{
      _id: { toString(): string };
      staffId: string;
      startAt: Date;
      endAt: Date;
      reason?: string;
    }>;
    return docs.map((doc) => mapBlock(doc));
  }
}
