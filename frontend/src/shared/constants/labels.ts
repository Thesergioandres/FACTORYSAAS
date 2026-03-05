export type VerticalLabels = {
  staff: string;
  staffPlural: string;
  service: string;
  appointment: string;
};

export const verticalLabels: Record<string, VerticalLabels> = {
  barberia: {
    staff: 'Barbero',
    staffPlural: 'Barberos',
    service: 'Servicio',
    appointment: 'Cita'
  },
  estetica: {
    staff: 'Estilista',
    staffPlural: 'Estilistas',
    service: 'Servicio',
    appointment: 'Cita'
  },
  odontologia: {
    staff: 'Odontologo',
    staffPlural: 'Odontologos',
    service: 'Servicio',
    appointment: 'Cita'
  },
  default: {
    staff: 'Profesional',
    staffPlural: 'Profesionales',
    service: 'Servicio',
    appointment: 'Cita'
  }
};
