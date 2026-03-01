import { whatsappQueue } from '../../../../jobs/whatsappQueue';

export class BullmqWhatsAppProvider {
  async send({ appointmentId, tenantId, event, roleTarget, phone, message }: { appointmentId: string; tenantId: string; event: string; roleTarget: string; phone: string; message: string }) {
    await whatsappQueue.add(
      'send-whatsapp',
      { appointmentId, tenantId, event, roleTarget, phone, message },
      { attempts: 3, removeOnComplete: 200, removeOnFail: 200 }
    );

    return { status: 'PENDIENTE' as const };
  }
}
