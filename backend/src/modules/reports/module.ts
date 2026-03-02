import { createReportsRoutes } from './interfaces/http/reportsRoutes';
import type { authenticateJwt } from '../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../shared/interfaces/http/middlewares/requireRoles';

export function createReportsModule({
  usersRepository,
  servicesRepository,
  appointmentsRepository,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  usersRepository: { list(tenantId: string, role?: string): Promise<Array<{ id: string; role: string; name?: string; commissionRate?: number }>> };
  servicesRepository: { list(tenantId: string, options?: { onlyActive?: boolean }): Promise<Array<{ id: string; price?: number }>> };
  appointmentsRepository: { list(tenantId: string, filters?: { clientId?: string; barberId?: string }): Promise<Array<{ id: string; status: string; clientId: string; barberId: string; serviceId: string; startAt: string }>> };
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const getSummary = async (tenantId: string) => {
    const [users, services, appointments] = await Promise.all([
      usersRepository.list(tenantId),
      servicesRepository.list(tenantId),
      appointmentsRepository.list(tenantId)
    ]);

    const byStatus = appointments.reduce<Record<string, number>>((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {});

    const barbersCount = users.filter(u => u.role === 'BARBER').length;
    const productivity = barbersCount > 0 ? +(appointments.length / barbersCount).toFixed(1) : 0;
    
    // Asumimos un aproximado de 8 citas máximas por barbero al día.
    const occupancy = barbersCount > 0 
      ? Math.min(100, Math.round((appointments.length / (barbersCount * 8)) * 100)) + '%'
      : '0%';

    const clientCounts: Record<string, number> = {};
    appointments.forEach(apt => {
      if (apt.clientId) {
        clientCounts[apt.clientId] = (clientCounts[apt.clientId] || 0) + 1;
      }
    });
    
    const uniqueClients = Object.keys(clientCounts).length;
    const returningClients = Object.values(clientCounts).filter(c => c > 1).length;
    const retention = uniqueClients > 0 ? Math.round((returningClients / uniqueClients) * 100) + '%' : '0%';

    return {
      totals: {
        users: users.length,
        services: services.length,
        appointments: appointments.length
      },
      appointmentsByStatus: byStatus,
      analytics: {
        productivity: `${productivity} citas / barbero`,
        occupancy,
        retention
      }
    };
  };

  const getDaily = async (tenantId: string, date?: string) => {
    const [users, services, appointments] = await Promise.all([
      usersRepository.list(tenantId),
      servicesRepository.list(tenantId),
      appointmentsRepository.list(tenantId)
    ]);

    const target = date ? new Date(`${date}T00:00:00`) : new Date();
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const servicePrices = new Map(services.map((service) => [service.id, Number(service.price || 0)]));
    const barberMap = new Map(
      users
        .filter((user) => user.role === 'BARBER')
        .map((user) => [user.id, user])
    );

    const commissionByBarber: Record<string, { barberId: string; barberName: string; rate: number; total: number; appointments: number }> = {};
    let grossRevenue = 0;

    appointments
      .filter((appointment) => appointment.status === 'COMPLETADA')
      .filter((appointment) => {
        const startAt = new Date(appointment.startAt);
        return startAt >= start && startAt < end;
      })
      .forEach((appointment) => {
        const price = servicePrices.get(appointment.serviceId) || 0;
        grossRevenue += price;

        const barber = barberMap.get(appointment.barberId);
        const rate = barber?.commissionRate ?? 0.3;
        const key = appointment.barberId;

        if (!commissionByBarber[key]) {
          commissionByBarber[key] = {
            barberId: key,
            barberName: barber?.name || 'Sin nombre',
            rate,
            total: 0,
            appointments: 0
          };
        }

        commissionByBarber[key].appointments += 1;
        commissionByBarber[key].total += price * rate;
      });

    return {
      date: start.toISOString().split('T')[0],
      grossRevenue: Number(grossRevenue.toFixed(2)),
      commissions: Object.values(commissionByBarber).map((item) => ({
        ...item,
        total: Number(item.total.toFixed(2))
      }))
    };
  };

  const reportsRoutes = createReportsRoutes({
    getSummary,
    getDaily,
    authenticateJwt: authMiddleware,
    requireRoles: requireRolesMiddleware
  });

  return { reportsRoutes };
}
