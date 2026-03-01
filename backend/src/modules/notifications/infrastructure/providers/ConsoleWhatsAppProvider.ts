export class ConsoleWhatsAppProvider {
  async send({ appointmentId, tenantId, event, roleTarget, phone, message }: { appointmentId: string; tenantId: string; event: string; roleTarget: string; phone: string; message: string }) {
    const payload = {
      appointmentId,
      tenantId,
      event,
      roleTarget,
      phone,
      message
    };

    console.info('[WhatsApp][Mock]', payload);
    return { status: 'ENVIADO' as const };
  }
}
