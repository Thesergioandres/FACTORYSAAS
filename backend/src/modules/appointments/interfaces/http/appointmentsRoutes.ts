import { Router, type Request, type Response } from 'express';
import type { AppointmentsRepository } from '../../application/ports/AppointmentsRepository';
import type { CreateAppointmentUseCase } from '../../application/use-cases/createAppointmentUseCase';
import type { UpdateAppointmentStatusUseCase } from '../../application/use-cases/updateAppointmentStatusUseCase';
import type { CancelOrRescheduleAppointmentUseCase } from '../../application/use-cases/cancelOrRescheduleAppointmentUseCase';
import type { ReassignAppointmentUseCase } from '../../application/use-cases/reassignAppointmentUseCase';
import type { AppointmentHistoryRepository } from '../../application/ports/AppointmentHistoryRepository';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';
import type { requireApproved } from '../../../../shared/interfaces/http/middlewares/requireApproved';

export function createAppointmentsRoutes({
  appointmentsRepository,
  createAppointmentUseCase,
  updateAppointmentStatusUseCase,
  cancelOrRescheduleAppointmentUseCase,
  reassignAppointmentUseCase,
  historyRepository,
  authenticateJwt: authMiddleware,
  requireApproved: requireApprovedMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  appointmentsRepository: AppointmentsRepository;
  createAppointmentUseCase: CreateAppointmentUseCase;
  updateAppointmentStatusUseCase: UpdateAppointmentStatusUseCase;
  cancelOrRescheduleAppointmentUseCase: CancelOrRescheduleAppointmentUseCase;
  reassignAppointmentUseCase: ReassignAppointmentUseCase;
  historyRepository: AppointmentHistoryRepository;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireApproved: ReturnType<typeof requireApproved>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

  router.get('/', authMiddleware, requireApprovedMiddleware, requireRolesMiddleware('ADMIN', 'STAFF', 'CLIENT'), async (req: Request, res: Response) => {
    const requesterRole = req.auth?.role;
    const requesterId = req.auth?.sub;

    const clientId = requesterRole === 'CLIENT' ? requesterId : (typeof req.query.clientId === 'string' ? req.query.clientId : undefined);
    const staffId = requesterRole === 'STAFF' ? requesterId : (typeof req.query.staffId === 'string' ? req.query.staffId : undefined);

    const startFromRaw = typeof req.query.startFrom === 'string' ? new Date(req.query.startFrom) : undefined;
    const startToRaw = typeof req.query.startTo === 'string' ? new Date(req.query.startTo) : undefined;
    const startFrom = startFromRaw && !Number.isNaN(startFromRaw.getTime()) ? startFromRaw : undefined;
    const startTo = startToRaw && !Number.isNaN(startToRaw.getTime()) ? startToRaw : undefined;

    const tenantId = req.auth?.tenantId;
    if (!tenantId && requesterRole !== 'GOD') return res.status(403).json({ message: 'No tenantId' });

    const appointments = await appointmentsRepository.list(tenantId!, {
      clientId,
      staffId,
      startFrom,
      startTo
    });

    res.json(appointments);
  });

  router.post('/', authMiddleware, requireApprovedMiddleware, requireRolesMiddleware('ADMIN', 'CLIENT'), async (req: Request, res: Response) => {
    const requesterRole = req.auth?.role;
    const requesterId = req.auth?.sub;

    const payload = {
      ...(req.body || {}),
      clientId: requesterRole === 'CLIENT' ? requesterId : (req.body as { clientId?: string })?.clientId
    };

    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const result = await createAppointmentUseCase.execute({
      ...(payload || {}),
      tenantId,
      branchId: req.body?.branchId,
      actorRole: requesterRole,
      actorUserId: requesterId
    });
    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error, paymentUrl: result.paymentUrl });
    }

    return res.status(201).json(result.appointment);
  });

  router.patch('/:id/status', authMiddleware, requireApprovedMiddleware, requireRolesMiddleware('ADMIN', 'STAFF'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const result = await updateAppointmentStatusUseCase.execute({
      tenantId,
      appointmentId: req.params.id,
      nextStatus: (req.body as { nextStatus?: string })?.nextStatus,
      actorRole: req.auth?.role,
      actorUserId: req.auth?.sub
    });

    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.json(result.appointment);
  });

  router.post('/:id/cancel', authMiddleware, requireApprovedMiddleware, requireRolesMiddleware('ADMIN', 'CLIENT'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const result = await cancelOrRescheduleAppointmentUseCase.cancel({
      tenantId,
      appointmentId: req.params.id,
      actorRole: req.auth?.role || 'CLIENT',
      actorUserId: req.auth?.sub || ''
    });

    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.json(result.appointment);
  });

  router.post('/:id/reschedule', authMiddleware, requireApprovedMiddleware, requireRolesMiddleware('ADMIN', 'CLIENT'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const result = await cancelOrRescheduleAppointmentUseCase.reschedule({
      tenantId,
      appointmentId: req.params.id,
      actorRole: req.auth?.role || 'CLIENT',
      actorUserId: req.auth?.sub || '',
      startAt: (req.body as { startAt?: string })?.startAt || ''
    });

    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.json(result.appointment);
  });

  router.post('/:id/reassign', authMiddleware, requireApprovedMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const result = await reassignAppointmentUseCase.execute({
      tenantId,
      appointmentId: req.params.id,
      newStaffId: (req.body as { newStaffId?: string })?.newStaffId,
      actorRole: req.auth?.role,
      actorUserId: req.auth?.sub
    });

    if ('error' in result) {
      return res.status(result.statusCode).json({ message: result.error });
    }

    return res.json(result.appointment);
  });

  router.get('/:id/history', authMiddleware, requireApprovedMiddleware, requireRolesMiddleware('ADMIN', 'STAFF', 'CLIENT'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const appointment = await appointmentsRepository.findById(req.params.id, tenantId);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    const requesterRole = req.auth?.role;
    const requesterId = req.auth?.sub;
    if (requesterRole === 'CLIENT' && appointment.clientId !== requesterId) {
      return res.status(403).json({ message: 'No autorizado para ver este historial' });
    }

    if (requesterRole === 'STAFF' && appointment.staffId !== requesterId) {
      return res.status(403).json({ message: 'No autorizado para ver este historial' });
    }

    const history = await historyRepository.listByAppointment(req.params.id);
    return res.json(history);
  });

  return router;
}
