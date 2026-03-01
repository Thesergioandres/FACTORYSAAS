import bcrypt from 'bcryptjs';
import { UserModel } from '../shared/infrastructure/mongoose/models/UserModel';
import { ServiceModel } from '../shared/infrastructure/mongoose/models/ServiceModel';
import { AppointmentModel } from '../shared/infrastructure/mongoose/models/AppointmentModel';
import { PlanModel } from '../shared/infrastructure/mongoose/models/PlanModel';
import { TenantModel } from '../shared/infrastructure/mongoose/models/TenantModel';
import { BranchModel } from '../shared/infrastructure/mongoose/models/BranchModel';

async function ensureUser({
  name,
  email,
  phone,
  password,
  role,
  whatsappConsent,
  approved,
  tenantId,
  branchIds
}: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'GOD' | 'ADMIN' | 'BARBER' | 'CLIENT';
  whatsappConsent: boolean;
  approved: boolean;
  tenantId?: string | null;
  branchIds?: string[];
}) {
  const existing = await UserModel.findOne({ email });
  if (existing) {
    return existing;
  }

  return UserModel.create({
    name,
    email,
    phone,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    active: true,
    whatsappConsent,
    approved,
    tenantId: tenantId ?? null,
    branchIds: branchIds ?? []
  });
}

async function ensurePlan(input: { name: string; price: number; maxBranches: number; maxBarbers: number; maxMonthlyAppointments: number; features: string[] }) {
  const existing = await PlanModel.findOne({ name: input.name });
  if (existing) return existing;
  return PlanModel.create(input);
}

async function ensureTenant(input: {
  name: string;
  slug: string;
  subdomain: string;
  planId: string;
}) {
  const existing = await TenantModel.findOne({ slug: input.slug });
  if (existing) return existing;
  return TenantModel.create({
    name: input.name,
    slug: input.slug,
    subdomain: input.subdomain,
    planId: input.planId,
    status: 'active'
  });
}

async function ensureBranch(input: { tenantId: string; name: string; address: string; phone?: string }) {
  const existing = await BranchModel.findOne({ tenantId: input.tenantId, name: input.name });
  if (existing) return existing;
  return BranchModel.create({
    tenantId: input.tenantId,
    name: input.name,
    address: input.address,
    phone: input.phone || ''
  });
}

export async function seedMongoData() {
  const trialPlan = await ensurePlan({
    name: 'Trial',
    price: 0,
    maxBranches: 1,
    maxBarbers: 2,
    maxMonthlyAppointments: 80,
    features: ['reports']
  });
  const proPlan = await ensurePlan({
    name: 'Pro',
    price: 49,
    maxBranches: 5,
    maxBarbers: 15,
    maxMonthlyAppointments: 1000,
    features: ['reports', 'whatsapp_custom']
  });

  const tenant = await ensureTenant({
    name: 'Barberia Noir',
    slug: 'noir',
    subdomain: 'noir',
    planId: proPlan._id.toString()
  });

  const branch = await ensureBranch({
    tenantId: tenant._id.toString(),
    name: 'Sede Principal',
    address: 'Pendiente',
    phone: '+573000000000'
  });

  await ensureUser({
    name: 'God Root',
    email: 'god@barberia.com',
    phone: '+573000000000',
    password: 'god123',
    role: 'GOD',
    whatsappConsent: true,
    approved: true,
    tenantId: null
  });

  const admin = await ensureUser({
    name: 'Administrador',
    email: 'admin@barberia.com',
    phone: '+573000000001',
    password: 'admin123',
    role: 'ADMIN',
    whatsappConsent: true,
    approved: true,
    tenantId: tenant._id.toString(),
    branchIds: [branch._id.toString()]
  });

  const barber = await ensureUser({
    name: 'Barbero Demo',
    email: 'barbero@barberia.com',
    phone: '+573000000002',
    password: 'barbero123',
    role: 'BARBER',
    whatsappConsent: true,
    approved: true,
    tenantId: tenant._id.toString(),
    branchIds: [branch._id.toString()]
  });

  const client = await ensureUser({
    name: 'Cliente Demo',
    email: 'cliente@barberia.com',
    phone: '+573000000003',
    password: 'cliente123',
    role: 'CLIENT',
    whatsappConsent: true,
    approved: true,
    tenantId: tenant._id.toString()
  });

  const serviceCount = await ServiceModel.countDocuments({ tenantId: tenant._id.toString() });
  if (serviceCount === 0) {
    await ServiceModel.insertMany([
      {
        tenantId: tenant._id.toString(),
        name: 'Corte clásico',
        description: 'Corte tradicional con máquina y tijera.',
        durationMinutes: 30,
        price: 12,
        active: true
      },
      {
        tenantId: tenant._id.toString(),
        name: 'Barba premium',
        description: 'Perfilado y arreglo de barba.',
        durationMinutes: 25,
        price: 10,
        active: true
      }
    ]);
  }

  const appointmentCount = await AppointmentModel.countDocuments({ tenantId: tenant._id.toString() });
  if (appointmentCount === 0) {
    const firstService = await ServiceModel.findOne({ tenantId: tenant._id.toString() });
    if (firstService) {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      tomorrow.setHours(10, 0, 0, 0);

      await AppointmentModel.create({
        tenantId: tenant._id.toString(),
        branchId: branch._id.toString(),
        clientId: admin._id.toString(),
        barberId: barber._id.toString(),
        serviceId: firstService._id.toString(),
        startAt: tomorrow,
        endAt: new Date(tomorrow.getTime() + firstService.durationMinutes * 60 * 1000),
        status: 'PENDIENTE',
        notes: 'Seed appointment'
      });
    }
  }

  return { admin, barber, client, tenant, branch, trialPlan, proPlan };
}
