import mongoose, { type Model } from 'mongoose';

type AuditLogDocument = {
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
};

const auditLogSchema = new mongoose.Schema<AuditLogDocument>(
  {
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    details: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: () => new Date(), index: true }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

auditLogSchema.index({ timestamp: -1 });

export const AuditLogModel: Model<AuditLogDocument> =
  (mongoose.models.AuditLog as Model<AuditLogDocument>) ||
  mongoose.model('AuditLog', auditLogSchema);
