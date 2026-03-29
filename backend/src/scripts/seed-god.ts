import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { UserModel } from '../shared/infrastructure/mongoose/models/UserModel';
import { TenantModel } from '../shared/infrastructure/mongoose/models/TenantModel';
import { ProductModel } from '../shared/infrastructure/mongoose/models/ProductModel';
import { PlanModel } from '../shared/infrastructure/mongoose/models/PlanModel';
import { TenantStatus } from '../modules/tenants/domain/enums/TenantEnums';

async function seedGod() {
  try {
    console.log('🔄 Iniciando conexión a MongoDB para inyección de datos de prueba...');
    await mongoose.connect(env.mongodbUri, {
      minPoolSize: 1,
      maxPoolSize: 5
    });
    console.log('✅ Conectado a MongoDB.');

    console.warn('⚠️ ATENCIÓN: Formateando por completo la base de datos...');
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (let collection of collections) {
         await collection.drop().catch(() => {});
      }
    }
    console.log('🗑️ Base de datos eliminada/formateada de forma segura.');

    console.log('💎 Creando Plan de prueba...');
    const testPlan = await PlanModel.create({
      name: 'Plan Factory Premium',
      price: 99.99,
      maxBranches: 5,
      maxStaff: 20,
      maxMonthlyAppointments: 1000,
      features: ['erp_retail', 'inventory_management', 'pos_module']
    });

    console.log('🏢 Creando Tenant de prueba...');
    const testTenant = await TenantModel.create({
      name: 'Factory Test Shop',
      slug: 'factory-test-shop',
      planId: testPlan._id.toString(), // Usamos el ID real del plan creado
      subdomain: 'test-shop',
      verticalSlug: 'barberia',
      status: TenantStatus.ACTIVE,
      config: {
        features: { erp_retail: true, gamification: false, credits: false },
        bufferTimeMinutes: 10,
        requirePaymentForNoShows: false,
        maxNoShowsBeforePayment: 3,
        minAdvanceMinutes: 60,
        cancelLimitMinutes: 120,
        rescheduleLimitMinutes: 120,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        reminderMinutes: [120],
        whatsappEnabledEvents: {},
        whatsappTemplates: {},
        whatsappDebounceSeconds: 60
      }
    });

    console.log('🛡️ Generando credenciales maestras para el rol GOD...');
    const passwordHash = await bcrypt.hash('god123', 10);

    const godUser = await UserModel.create({
      name: 'Super Admin GOD',
      email: 'god@gmail.com',
      phone: '0000000000', 
      passwordHash: passwordHash,
      role: 'GOD',
      active: true,
      whatsappConsent: true,
      approved: true,
      tenantId: testTenant._id.toString() 
    });

    console.log('📦 Creando Producto de prueba...');
    await ProductModel.create({
      tenantId: testTenant._id.toString(),
      name: 'Corte Premium',
      sku: 'CP-001',
      category: 'Servicios de Lujo',
      description: 'Corte de cabello con ritual de toalla caliente y masaje capilar.',
      price: 25.0,
      stock: 50,
      active: true,
      lastCost: 5.0,
      averageCost: 5.0
    });

    console.log('🎉 INYECCIÓN EXITOSA: Datos de prueba creados.');
    console.log('----------------------------------------------------');
    console.log(`Plan:     ${testPlan.name}`);
    console.log(`Tenant:   ${testTenant.name} (${testTenant._id})`);
    console.log('Admin:    god@gmail.com');
    console.log('Password: god123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos.');
    process.exit(0);
  } catch (error) {
    console.error('❌ FATAL ERROR ejecutando Seed Script:', error);
    process.exit(1);
  }
}

seedGod();
