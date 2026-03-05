import { Queue, Worker, type Job } from 'bullmq';
import mongoose from 'mongoose';
import { redisConnectionOptions } from '../config/redis';
import { env } from '../config/env';
import { database } from '../shared/infrastructure/memory/database';
import { AppointmentModel } from '../shared/infrastructure/mongoose/models/AppointmentModel';
import { UserModel } from '../shared/infrastructure/mongoose/models/UserModel';
import { WhatsAppLogModel } from '../shared/infrastructure/mongoose/models/WhatsAppLogModel';
import { NotificationsService } from '../modules/notifications/application/NotificationsService';
import { BullmqWhatsAppProvider } from '../modules/notifications/infrastructure/providers/BullmqWhatsAppProvider';
import { ConsoleWhatsAppProvider } from '../modules/notifications/infrastructure/providers/ConsoleWhatsAppProvider';
import { InMemoryTenantsRepository } from '../modules/tenants/infrastructure/persistence/InMemoryTenantsRepository';
import { MongoTenantsRepository } from '../modules/tenants/infrastructure/persistence/MongoTenantsRepository';

const connection = redisConnectionOptions;
export const reminderQueue = new Queue('reminder-jobs', { connection });

const provider = env.whatsappProvider === 'bullmq'
  ? new BullmqWhatsAppProvider()
  : new ConsoleWhatsAppProvider();
const tenantsRepository = env.useMongo ? new MongoTenantsRepository() : new InMemoryTenantsRepository();
const notificationsService = new NotificationsService(provider, tenantsRepository);

const JOB_NAME = 'scan-reminders';

async function hasReminderLog(appointmentId: string, event: string) {
  if (mongoose.connection.readyState !== 1) {
    return false;
  }

  const existing = await WhatsAppLogModel.findOne({ appointmentId, event }).lean();
  return Boolean(existing);
}

async function processReminders() {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const reminderMinutes = database.appConfig.reminderMinutes || [];
  const now = new Date();
  const windowMs = 5 * 60 * 1000;

  for (const minutes of reminderMinutes) {
    const targetStart = new Date(now.getTime() + minutes * 60 * 1000);
    const targetEnd = new Date(targetStart.getTime() + windowMs);

    const appointments = await AppointmentModel.find({
      startAt: { $gte: targetStart, $lt: targetEnd },
      status: { $in: ['PENDIENTE', 'CONFIRMADA'] }
    }).lean();

    for (const appointment of appointments) {
      const event = `APPOINTMENT_REMINDER_${minutes}`;
      const appointmentId = appointment._id.toString();

      if (await hasReminderLog(appointmentId, event)) {
        continue;
      }

      const users = await UserModel.find({ _id: { $in: [appointment.clientId, appointment.staffId] } }).lean();
      const client = users.find((user) => user._id.toString() === appointment.clientId);
      const staff = users.find((user) => user._id.toString() === appointment.staffId);

      await notificationsService.emitEvent({
        event,
        appointment: {
          id: appointmentId,
          tenantId: appointment.tenantId,
          startAt: new Date(appointment.startAt).toISOString(),
          status: appointment.status
        },
        recipients: [
          client ? { id: client._id.toString(), role: client.role, phone: client.phone, whatsappConsent: client.whatsappConsent } : null,
          staff ? { id: staff._id.toString(), role: staff.role, phone: staff.phone, whatsappConsent: staff.whatsappConsent } : null
        ].filter(Boolean) as Array<{ id: string; role: string; phone?: string; whatsappConsent?: boolean }>
      });
    }
  }
}

const worker = new Worker(
  'reminder-jobs',
  async (_job: Job) => {
    await processReminders();
  },
  { connection }
);

worker.on('failed', (job, err) => {
  console.error('Reminder worker failed:', job?.id, err.message);
});

async function ensureRepeatableJob() {
  const repeat = { every: 5 * 60 * 1000 };
  const existing = await reminderQueue.getRepeatableJobs();
  const alreadyScheduled = existing.some((item) => item.name === JOB_NAME);
  if (!alreadyScheduled) {
    await reminderQueue.add(JOB_NAME, {}, { repeat });
  }
}

ensureRepeatableJob().catch((err: Error) => {
  console.error('Failed to schedule reminder job:', err.message);
});
