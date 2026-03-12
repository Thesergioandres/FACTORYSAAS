import mongoose, { type Model } from 'mongoose';

export type TableDocument = {
  tenantId: string;
  name: string;
  capacity?: number;
  currentOrderId?: string;
  status: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'LIMPIEZA';
  updatedAt: Date;
  createdAt: Date;
};

const tableSchema = new mongoose.Schema<TableDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    capacity: { type: Number },
    currentOrderId: { type: String, default: null },
    status: { type: String, required: true, enum: ['LIBRE', 'OCUPADA', 'RESERVADA', 'LIMPIEZA'], default: 'LIBRE' }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

tableSchema.index({ tenantId: 1, name: 1 });

export const TableModel: Model<TableDocument> =
  (mongoose.models.Table as Model<TableDocument>) ||
  mongoose.model('Table', tableSchema);
