export type AppointmentStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'CANCELADA'
  | 'COMPLETADA'
  | 'NO_ASISTIO';

export type Appointment = {
  id: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
};
