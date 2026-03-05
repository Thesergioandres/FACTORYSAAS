import mongoose, { type Model } from 'mongoose';

type AppointmentHistoryDocument = {
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
  createdAt: Date;
};

const appointmentHistorySchema = new mongoose.Schema<AppointmentHistoryDocument>(
  {
    appointmentId: { type: String, required: true, index: true },
    actorRole: { type: String, required: true },
    actorUserId: { type: String, required: true },
    action: { type: String, required: true },
    prevStatus: { type: String, default: null },
    nextStatus: { type: String, default: null },
    prevStartAt: { type: Date, default: null },
    nextStartAt: { type: Date, default: null },
    prevEndAt: { type: Date, default: null },
    nextEndAt: { type: Date, default: null },
    prevStaffId: { type: String, default: null },
    nextStaffId: { type: String, default: null }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export const AppointmentHistoryModel: Model<AppointmentHistoryDocument> =
  (mongoose.models.AppointmentHistory as Model<AppointmentHistoryDocument>) ||
  mongoose.model('AppointmentHistory', appointmentHistorySchema);
