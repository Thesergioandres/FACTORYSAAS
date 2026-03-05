import { database } from '../../shared/infrastructure/memory/database';
import { InMemoryAppointmentsRepository } from './infrastructure/persistence/InMemoryAppointmentsRepository';
import { MongoAppointmentsRepository } from './infrastructure/persistence/MongoAppointmentsRepository';
import { InMemoryAppointmentHistoryRepository } from './infrastructure/persistence/InMemoryAppointmentHistoryRepository';
import { MongoAppointmentHistoryRepository } from './infrastructure/persistence/MongoAppointmentHistoryRepository';
import { CreateAppointmentUseCase } from './application/use-cases/createAppointmentUseCase';
import { UpdateAppointmentStatusUseCase } from './application/use-cases/updateAppointmentStatusUseCase';
import { CancelOrRescheduleAppointmentUseCase } from './application/use-cases/cancelOrRescheduleAppointmentUseCase';
import { ReassignAppointmentUseCase } from './application/use-cases/reassignAppointmentUseCase';
import { createAppointmentsRoutes } from './interfaces/http/appointmentsRoutes';
import type { authenticateJwt } from '../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../shared/interfaces/http/middlewares/requireRoles';
import type { requireApproved } from '../../shared/interfaces/http/middlewares/requireApproved';

export function createAppointmentsModule({
  tenantsRepository,
  servicesRepository,
  usersRepository,
  availabilityRepository,
  notificationsService,
  useMongo = false,
  authenticateJwt: authMiddleware,
  requireApproved: requireApprovedMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  servicesRepository: { findById(id: string, tenantId: string): Promise<{ durationMinutes: number; active: boolean } | null> };
  usersRepository: { list(tenantId: string, role?: string): Promise<Array<{ id: string; role: string; phone?: string; whatsappConsent?: boolean }>> };
  tenantsRepository: { findById(id: string): Promise<{ id: string; config: { bufferTimeMinutes: number; maxNoShowsBeforePayment: number; requirePaymentForNoShows: boolean } } | null> };
  availabilityRepository: { listSchedules(staffId: string): Promise<Array<{ dayOfWeek: number; startTime: string; endTime: string }>>; listBlocks(staffId: string): Promise<Array<{ startAt: string; endAt: string }>> };
  notificationsService: { emitEvent(input: { event: string; appointment: { id: string; startAt: string; status?: string; tenantId: string }; recipients: Array<{ id: string; role: string; phone?: string; whatsappConsent?: boolean }> }): Promise<void> };
  useMongo?: boolean;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireApproved: ReturnType<typeof requireApproved>;
  requireRoles: typeof requireRoles;
}) {
  const appointmentsRepository = useMongo
    ? new MongoAppointmentsRepository()
    : new InMemoryAppointmentsRepository();

  const historyRepository = useMongo
    ? new MongoAppointmentHistoryRepository()
    : new InMemoryAppointmentHistoryRepository();

  const createAppointmentUseCase = new CreateAppointmentUseCase({
    appointmentsRepository,
    servicesRepository,
    usersRepository,
    availabilityRepository,
    notificationsService,
    historyRepository,
    tenantsRepository,
    config: {
      minAdvanceMinutes: database.appConfig.minAdvanceMinutes
    }
  });

  const updateAppointmentStatusUseCase = new UpdateAppointmentStatusUseCase({
    appointmentsRepository,
    usersRepository,
    notificationsService,
    historyRepository
  });

  const cancelOrRescheduleAppointmentUseCase = new CancelOrRescheduleAppointmentUseCase({
    appointmentsRepository,
    servicesRepository,
    usersRepository,
    notificationsService,
    historyRepository,
    tenantsRepository,
    config: {
      cancelLimitMinutes: database.appConfig.cancelLimitMinutes,
      rescheduleLimitMinutes: database.appConfig.rescheduleLimitMinutes
    }
  });

  const reassignAppointmentUseCase = new ReassignAppointmentUseCase({
    appointmentsRepository,
    availabilityRepository,
    servicesRepository,
    usersRepository,
    notificationsService,
    historyRepository,
    tenantsRepository
  });

  const appointmentsRoutes = createAppointmentsRoutes({
    appointmentsRepository,
    createAppointmentUseCase,
    updateAppointmentStatusUseCase,
    cancelOrRescheduleAppointmentUseCase,
    reassignAppointmentUseCase,
    historyRepository,
    authenticateJwt: authMiddleware,
    requireApproved: requireApprovedMiddleware,
    requireRoles: requireRolesMiddleware
  });

  return { appointmentsRoutes, appointmentsRepository };
}
