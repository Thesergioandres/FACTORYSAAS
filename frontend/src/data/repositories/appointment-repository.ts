export interface AppointmentRepository {
  bookAppointment(input: {
    serviceId: string;
    staffId: string;
    clientId: string;
    startAt: string;
  }): Promise<void>;
}
