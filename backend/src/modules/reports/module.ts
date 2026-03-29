import { createReportsRoutes } from './interfaces/http/reportsRoutes';
import type { authenticateJwt } from '../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../shared/interfaces/http/middlewares/requireRoles';

export function createReportsModule({
  usersRepository,
  servicesRepository,
  appointmentsRepository,
  inventoryRepository,
  posRepository,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  usersRepository: { list(tenantId: string, role?: string): Promise<Array<{ id: string; role: string; name?: string; commissionRate?: number }>> };
  servicesRepository: { list(tenantId: string, options?: { onlyActive?: boolean }): Promise<Array<{ id: string; price?: number }>> };
  appointmentsRepository: { list(tenantId: string, filters?: { clientId?: string; staffId?: string }): Promise<Array<{ id: string; status: string; clientId: string; staffId: string; serviceId: string; startAt: string }>> };
  inventoryRepository: { list(tenantId: string): Promise<Array<{ id: string }>> };
  posRepository: { listSales(tenantId: string): Promise<Array<{ id: string; total: number; sellerId?: string }>> };
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const getSummary = async (tenantId: string) => {
    const [users, services, appointments, products, sales] = await Promise.all([
      usersRepository.list(tenantId),
      servicesRepository.list(tenantId),
      appointmentsRepository.list(tenantId),
      inventoryRepository.list(tenantId),
      posRepository.listSales(tenantId)
    ]);

    const servicePrices = new Map(services.map((service) => [service.id, Number(service.price || 0)]));
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const appointmentsToday = appointments.filter((appointment) => {
      const startAt = new Date(appointment.startAt);
      return startAt >= start && startAt < end;
    });

    const totalSales = appointments
      .filter((appointment) => appointment.status === 'COMPLETADA')
      .reduce((sum, appointment) => sum + (servicePrices.get(appointment.serviceId) || 0), 0);

    const activeStaff = users.filter((user) => user.role === 'STAFF').length;

    const adminSalesAmount = sales.filter(s => !s.sellerId).reduce((sum, s) => sum + s.total, 0);
    const sellerSalesAmount = sales.filter(s => !!s.sellerId).reduce((sum, s) => sum + s.total, 0);
    const operatingExpenses = (adminSalesAmount + totalSales) * 0.15; // Deduce 15% as generic operational expense

    return {
      totalServiceSales: Number(totalSales.toFixed(2)),
      totalProductSales: Number((adminSalesAmount + sellerSalesAmount).toFixed(2)),
      adminProductSales: adminSalesAmount,
      sellerProductSales: sellerSalesAmount,
      netProfit: Number(((totalSales + adminSalesAmount) - operatingExpenses).toFixed(2)),
      appointmentsToday: appointmentsToday.length,
      totalProducts: products.length,
      activeStaff,
      salesTrend: [120, 300, 150, 400, 200, 500, 450]
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
    const staffMap = new Map(
      users
        .filter((user) => user.role === 'STAFF')
        .map((user) => [user.id, user])
    );

    const commissionByStaff: Record<string, { staffId: string; staffName: string; rate: number; total: number; appointments: number }> = {};
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

        const staff = staffMap.get(appointment.staffId);
        const rate = staff?.commissionRate ?? 0.3;
        const key = appointment.staffId;

        if (!commissionByStaff[key]) {
          commissionByStaff[key] = {
            staffId: key,
            staffName: staff?.name || 'Sin nombre',
            rate,
            total: 0,
            appointments: 0
          };
        }

        commissionByStaff[key].appointments += 1;
        commissionByStaff[key].total += price * rate;
      });

    return {
      date: start.toISOString().split('T')[0],
      grossRevenue: Number(grossRevenue.toFixed(2)),
      commissions: Object.values(commissionByStaff).map((item) => ({
        ...item,
        total: Number(item.total.toFixed(2))
      }))
    };
  };

  const getRange = async (tenantId: string, startDate: string, endDate: string) => {
    const [users, services, appointments] = await Promise.all([
      usersRepository.list(tenantId),
      servicesRepository.list(tenantId),
      appointmentsRepository.list(tenantId)
    ]);

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { error: 'Rango de fechas invalido' };
    }

    const rangeEnd = new Date(end);
    rangeEnd.setDate(rangeEnd.getDate() + 1);

    const servicePrices = new Map(services.map((service) => [service.id, Number(service.price || 0)]));
    const staffMap = new Map(
      users
        .filter((user) => user.role === 'STAFF')
        .map((user) => [user.id, user])
    );

    const commissionByStaff: Record<string, { staffId: string; staffName: string; rate: number; total: number; appointments: number }> = {};
    const dailyTotals: Record<string, { date: string; grossRevenue: number; commissions: number }> = {};
    let grossRevenue = 0;

    appointments
      .filter((appointment) => appointment.status === 'COMPLETADA')
      .filter((appointment) => {
        const startAt = new Date(appointment.startAt);
        return startAt >= start && startAt < rangeEnd;
      })
      .forEach((appointment) => {
        const price = servicePrices.get(appointment.serviceId) || 0;
        grossRevenue += price;

        const staff = staffMap.get(appointment.staffId);
        const rate = staff?.commissionRate ?? 0.3;
        const key = appointment.staffId;

        if (!commissionByStaff[key]) {
          commissionByStaff[key] = {
            staffId: key,
            staffName: staff?.name || 'Sin nombre',
            rate,
            total: 0,
            appointments: 0
          };
        }

        commissionByStaff[key].appointments += 1;
        commissionByStaff[key].total += price * rate;

        const dayKey = new Date(appointment.startAt).toISOString().split('T')[0];
        if (!dailyTotals[dayKey]) {
          dailyTotals[dayKey] = { date: dayKey, grossRevenue: 0, commissions: 0 };
        }

        dailyTotals[dayKey].grossRevenue += price;
        dailyTotals[dayKey].commissions += price * rate;
      });

    const days = Object.values(dailyTotals)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((day) => ({
        ...day,
        grossRevenue: Number(day.grossRevenue.toFixed(2)),
        commissions: Number(day.commissions.toFixed(2)),
        netRevenue: Number((day.grossRevenue - day.commissions).toFixed(2))
      }));

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      grossRevenue: Number(grossRevenue.toFixed(2)),
      commissions: Object.values(commissionByStaff).map((item) => ({
        ...item,
        total: Number(item.total.toFixed(2))
      })),
      days
    };
  };

  const reportsRoutes = createReportsRoutes({
    getSummary,
    getDaily,
    getRange,
    authenticateJwt: authMiddleware,
    requireRoles: requireRolesMiddleware
  });

  return { reportsRoutes };
}
