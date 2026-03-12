import { Router, type Request, type Response } from 'express';
import type { CreateSaleUseCase } from '../../application/use-cases/createSaleUseCase';
import type { PosRepository } from '../../application/ports/PosRepository';
import type { AppointmentsRepository } from '../../../appointments/application/ports/AppointmentsRepository';
import type { ServicesRepository } from '../../../services/application/ports/ServicesRepository';
import type { UsersRepository } from '../../../users/application/ports/UsersRepository';
import type { CreateInvoiceUseCase } from '../../../billing/application/use-cases/CreateInvoiceUseCase';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../../../shared/interfaces/http/middlewares/requireRoles';

export function createPosRoutes({
  posRepository,
  createSaleUseCase,
  appointmentsRepository,
  servicesRepository,
  usersRepository,
  createInvoiceUseCase,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware
}: {
  posRepository: PosRepository;
  createSaleUseCase: CreateSaleUseCase;
  appointmentsRepository: AppointmentsRepository;
  servicesRepository: ServicesRepository;
  usersRepository: UsersRepository;
  createInvoiceUseCase?: CreateInvoiceUseCase;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
}) {
  const router = Router();

  const normalizePaymentMethod = (value?: string) => {
    const method = (value || 'efectivo').toLowerCase();
    if (method.includes('tarjeta') || method.includes('card')) return 'card';
    if (method.includes('efectivo') || method.includes('cash')) return 'cash';
    return 'other';
  };

  router.get('/sales', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const sales = await posRepository.listSales(tenantId);
    return res.json(sales);
  });

  router.get('/sales/:id', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const sale = await posRepository.findById(tenantId, req.params.id);
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });

    return res.json(sale);
  });

  router.post('/sales', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const result = await createSaleUseCase.execute({
      tenantId,
      items: (req.body as { items?: Array<{ productId: string; name: string; quantity: number; price: number }> })?.items || [],
      paymentMethod: (req.body as { paymentMethod?: string })?.paymentMethod,
      tableId: (req.body as { tableId?: string })?.tableId
    });

    if ('error' in result) {
      return res.status(result.statusCode || 400).json({ message: result.error });
    }

    const payload = req.body as { paymentStatus?: string; currency?: string };
    const paymentStatus = (payload?.paymentStatus || '').toUpperCase();
    const currency = String(payload?.currency || 'COP');
    let invoiceError: string | undefined;
    let invoice = undefined as unknown;

    if (paymentStatus === 'PAGADA' && createInvoiceUseCase) {
      const invoiceResult = await createInvoiceUseCase.execute({
        tenantId,
        subtotal: result.sale.total,
        currency
      });
      if ('error' in invoiceResult) {
        invoiceError = invoiceResult.error;
      } else {
        invoice = invoiceResult.invoice;
      }
    }

    return res.status(201).json({ sale: result.sale, invoice, invoiceError });
  });

  router.get('/close', authMiddleware, requireRolesMiddleware('ADMIN'), async (req: Request, res: Response) => {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'No tenantId' });

    const startParam = typeof req.query.start === 'string' ? req.query.start : undefined;
    const endParam = typeof req.query.end === 'string' ? req.query.end : undefined;
    const start = startParam ? new Date(startParam) : new Date();
    const end = endParam ? new Date(endParam) : new Date(start);

    if (!startParam) {
      start.setHours(0, 0, 0, 0);
    }

    if (!endParam) {
      end.setHours(23, 59, 59, 999);
    }

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Rango invalido' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'end debe ser mayor a start' });
    }

    const [sales, appointments, services, staff] = await Promise.all([
      posRepository.listSales(tenantId),
      appointmentsRepository.list(tenantId, { startFrom: start, startTo: end }),
      servicesRepository.list(tenantId),
      usersRepository.list(tenantId, 'STAFF')
    ]);

    const salesInRange = sales.filter((sale) => {
      const createdAt = new Date(sale.createdAt);
      return createdAt >= start && createdAt <= end;
    });

    const paymentBreakdown = { cash: 0, card: 0, other: 0 };
    let productSalesTotal = 0;

    salesInRange.forEach((sale) => {
      productSalesTotal += sale.total;
      const method = normalizePaymentMethod(sale.paymentMethod);
      paymentBreakdown[method] += sale.total;
    });

    const servicePriceMap = new Map(services.map((service) => [service.id, Number(service.price || 0)]));
    const staffMap = new Map(staff.map((member) => [member.id, member]));
    const completedAppointments = appointments.filter((appointment) => appointment.status === 'COMPLETADA');

    const commissionByStaff: Record<string, { staffId: string; staffName: string; rate: number; sales: number; commission: number }> = {};
    let servicesTotal = 0;

    completedAppointments.forEach((appointment) => {
      const price = servicePriceMap.get(appointment.serviceId) || 0;
      servicesTotal += price;

      const staffMember = staffMap.get(appointment.staffId);
      const rate = staffMember?.commissionRate ?? 0.3;
      const key = appointment.staffId;
      if (!commissionByStaff[key]) {
        commissionByStaff[key] = {
          staffId: key,
          staffName: staffMember?.name || 'Sin nombre',
          rate,
          sales: 0,
          commission: 0
        };
      }
      commissionByStaff[key].sales += price;
      commissionByStaff[key].commission += price * rate;
    });

    const commissions = Object.values(commissionByStaff).map((item) => ({
      ...item,
      sales: Number(item.sales.toFixed(2)),
      commission: Number(item.commission.toFixed(2))
    }));

    paymentBreakdown.cash += servicesTotal;

    const totalCommissions = commissions.reduce((sum, item) => sum + item.commission, 0);
    const totalSales = Number((productSalesTotal + servicesTotal).toFixed(2));

    return res.json({
      range: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      totals: {
        products: Number(productSalesTotal.toFixed(2)),
        services: Number(servicesTotal.toFixed(2)),
        total: totalSales
      },
      paymentBreakdown: {
        cash: Number(paymentBreakdown.cash.toFixed(2)),
        card: Number(paymentBreakdown.card.toFixed(2)),
        other: Number(paymentBreakdown.other.toFixed(2))
      },
      commissions: {
        total: Number(totalCommissions.toFixed(2)),
        byStaff: commissions
      }
    });
  });

  return router;
}
