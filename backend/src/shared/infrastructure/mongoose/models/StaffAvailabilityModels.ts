import mongoose, { type Model } from 'mongoose';

type StaffScheduleDocument = {
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
};

type StaffBlockDocument = {
  staffId: string;
  startAt: Date;
  endAt: Date;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
};

const staffScheduleSchema = new mongoose.Schema<StaffScheduleDocument>(
  {
    staffId: { type: String, required: true, index: true },
    dayOfWeek: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  { timestamps: true }
);

staffScheduleSchema.index({ staffId: 1, dayOfWeek: 1 }, { unique: true });

const staffBlockSchema = new mongoose.Schema<StaffBlockDocument>(
  {
    staffId: { type: String, required: true, index: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    reason: { type: String, default: '' }
  },
  { timestamps: true }
);

export const StaffScheduleModel: Model<StaffScheduleDocument> =
  (mongoose.models.StaffSchedule as Model<StaffScheduleDocument>) ||
  mongoose.model('StaffSchedule', staffScheduleSchema);

export const StaffBlockModel: Model<StaffBlockDocument> =
  (mongoose.models.StaffBlock as Model<StaffBlockDocument>) ||
  mongoose.model('StaffBlock', staffBlockSchema);
