export type AppointmentHistoryAction =
  | 'CREATED'
  | 'STATUS_UPDATED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'REASSIGNED';

export type AppointmentHistoryRecord = {
  id: string;
  appointmentId: string;
  actorRole: string;
  actorUserId: string;
  action: AppointmentHistoryAction;
  prevStatus?: string;
  nextStatus?: string;
  prevStartAt?: string;
  nextStartAt?: string;
  prevEndAt?: string;
  nextEndAt?: string;
  prevStaffId?: string;
  nextStaffId?: string;
  createdAt: string;
};
