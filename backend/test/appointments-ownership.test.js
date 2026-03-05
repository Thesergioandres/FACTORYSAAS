const test = require('node:test');
const assert = require('node:assert/strict');
const { UpdateAppointmentStatusUseCase } = require('../src/modules/appointments/application/use-cases/updateAppointmentStatusUseCase');
const { CancelOrRescheduleAppointmentUseCase } = require('../src/modules/appointments/application/use-cases/cancelOrRescheduleAppointmentUseCase');

function makeAppointmentsRepo() {
  const appointment = {
    id: 'apt-1',
    clientId: 'client-1',
    staffId: 'staff-1',
    serviceId: 'service-1',
    startAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    status: 'CONFIRMADA'
  };

  return {
    async findById() {
      return { ...appointment };
    },
    async update() {
      return { ...appointment };
    },
    async findByStaffInRange() {
      return [];
    },
    async findByClientInRange() {
      return [];
    }
  };
}

const usersRepository = {
  async list() {
    return [
      { id: 'client-1', role: 'CLIENT', phone: '+573000000003', whatsappConsent: true },
      { id: 'staff-1', role: 'STAFF', phone: '+573000000002', whatsappConsent: true }
    ];
  }
};

const notificationsService = {
  async emitEvent() {}
};

test('staff no puede cambiar estado de cita ajena', async () => {
  const useCase = new UpdateAppointmentStatusUseCase({
    appointmentsRepository: makeAppointmentsRepo(),
    usersRepository,
    notificationsService
  });

  const result = await useCase.execute({
    appointmentId: 'apt-1',
    nextStatus: 'COMPLETADA',
    actorRole: 'STAFF',
    actorUserId: 'staff-2'
  });

  assert.equal(result.statusCode, 403);
});

test('cliente no puede cancelar cita de otro cliente', async () => {
  const useCase = new CancelOrRescheduleAppointmentUseCase({
    appointmentsRepository: makeAppointmentsRepo(),
    servicesRepository: { async findById() { return { id: 'service-1', durationMinutes: 30 }; } },
    usersRepository,
    notificationsService,
    config: { cancelLimitMinutes: 120, rescheduleLimitMinutes: 120 }
  });

  const result = await useCase.cancel({
    appointmentId: 'apt-1',
    actorRole: 'CLIENT',
    actorUserId: 'client-2'
  });

  assert.equal(result.statusCode, 403);
});
