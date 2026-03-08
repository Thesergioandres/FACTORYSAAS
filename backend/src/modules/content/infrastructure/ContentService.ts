import type { ContentGenerator } from '../application/ports/ContentGenerator';
import type { ContentPayload } from '../domain/entities/ContentPayload';

const COPY_BY_VERTICAL: Record<string, ContentPayload> = {
  restaurantes: {
    title: 'Restaurantes con flujo vivo y cocina conectada',
    subtitle: 'Controla mesas, comandas y caja en un solo panel con marca blanca.',
    benefits: ['Mapa de mesas en tiempo real', 'Comandas que no se pierden', 'Reportes de ventas por turno']
  },
  barberias: {
    title: 'Barberias que convierten visitas en clientes fieles',
    subtitle: 'Agenda inteligente, staff sincronizado y ventas con POS integrado.',
    benefits: ['Reservas 24/7', 'Comisiones automaticas', 'Inventario siempre listo']
  },
  clinicas: {
    title: 'Clinicas con operaciones seguras y medibles',
    subtitle: 'Historia clinica, agenda y cobros alineados al paciente.',
    benefits: ['Seguimiento post-consulta', 'Recordatorios automaticos', 'Control de insumos medicos']
  }
};

export class ContentService implements ContentGenerator {
  async generate(verticalId: string): Promise<ContentPayload> {
    const key = verticalId.trim().toLowerCase();
    if (COPY_BY_VERTICAL[key]) {
      return COPY_BY_VERTICAL[key];
    }

    return {
      title: `Plataforma white-label para ${key.replace(/-/g, ' ')}`,
      subtitle: 'Configura tu operacion, staff y ventas con la esencia de tu marca.',
      benefits: ['Personalizacion total de marca', 'Operaciones sincronizadas', 'Reportes en tiempo real']
    };
  }
}
