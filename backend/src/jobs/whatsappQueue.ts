import { Queue, Worker, type Job } from 'bullmq';
import mongoose from 'mongoose';
import { redisConnectionOptions } from '../config/redis';
import { database } from '../shared/infrastructure/memory/database';
import { isWithinQuietHours } from '../modules/appointments/domain/appointmentRules';
import { WhatsAppLogModel } from '../shared/infrastructure/mongoose/models/WhatsAppLogModel';

type WhatsAppJob = {
  appointmentId?: string | null;
  tenantId: string;
  event: string;
  roleTarget: string;
  phone: string;
  message: string;
};

const connection = redisConnectionOptions;
export const whatsappQueue = new Queue<WhatsAppJob, void, string>('whatsapp-jobs', { connection });

function shouldSkipByQuietHours(now: Date) {
  return isWithinQuietHours(now, database.appConfig.quietHoursStart, database.appConfig.quietHoursEnd);
}

async function persistLog(log: {
  id: string;
  appointmentId?: string | null;
  tenantId: string;
  event: string;
  roleTarget: string;
  phone: string;
  message: string;
  status: 'ENVIADO' | 'FALLIDO' | 'PENDIENTE';
  error: string | null;
  createdAt: string;
}) {
  database.whatsappLogs.push(log);

  if (mongoose.connection.readyState === 1) {
    await WhatsAppLogModel.create({
      tenantId: log.tenantId,
      appointmentId: log.appointmentId,
      event: log.event,
      roleTarget: log.roleTarget,
      phone: log.phone,
      message: log.message,
      status: log.status,
      error: log.error
    });
  }
}

const worker = new Worker<WhatsAppJob>(
  'whatsapp-jobs',
  async (job: Job<WhatsAppJob>) => {
    const payload = job.data;
    const now = new Date();

    if (shouldSkipByQuietHours(now)) {
      await persistLog({
        id: `${Date.now()}-${Math.random()}`,
        appointmentId: payload.appointmentId || null,
        tenantId: payload.tenantId,
        event: payload.event,
        roleTarget: payload.roleTarget,
        phone: payload.phone,
        message: payload.message,
        status: 'PENDIENTE',
        error: 'Quiet hours',
        createdAt: now.toISOString()
      });
      return;
    }

    await persistLog({
      id: `${Date.now()}-${Math.random()}`,
      appointmentId: payload.appointmentId || null,
      tenantId: payload.tenantId,
      event: payload.event,
      roleTarget: payload.roleTarget,
      phone: payload.phone,
      message: payload.message,
      status: 'ENVIADO',
      error: null,
      createdAt: now.toISOString()
    });
  },
  { connection }
);

worker.on('failed', (job, err) => {
  const payload = job?.data || ({} as WhatsAppJob);
  persistLog({
    id: `${Date.now()}-${Math.random()}`,
    appointmentId: payload.appointmentId || null,
    tenantId: payload.tenantId || 'unknown',
    event: payload.event || 'UNKNOWN',
    roleTarget: payload.roleTarget || 'UNKNOWN',
    phone: payload.phone || '',
    message: payload.message || '',
    status: 'FALLIDO',
    error: err.message,
    createdAt: new Date().toISOString()
  }).catch((logError: Error) => {
    console.error('No se pudo persistir log de WhatsApp:', logError.message);
  });
});
