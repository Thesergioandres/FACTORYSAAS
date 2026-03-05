import mongoose, { type Model } from 'mongoose';

type AppointmentDocument = {
  tenantId: string;
  branchId: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  startAt: Date;
  endAt: Date;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_ASISTIO';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

const appointmentSchema = new mongoose.Schema<AppointmentDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, index: true },
    clientId: { type: String, required: true, index: true },
    staffId: { type: String, required: true, index: true },
    serviceId: { type: String, required: true, index: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'NO_ASISTIO'],
      required: true,
      index: true
    },
    notes: { type: String, default: '' }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const AppointmentModel: Model<AppointmentDocument> =
  (mongoose.models.Appointment as Model<AppointmentDocument>) ||
  mongoose.model('Appointment', appointmentSchema);
