const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createTestApp } = require('./testAppFactory');

async function login(app, email, password) {
  const response = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
  return response.body;
}

test('cliente no puede cancelar cita de otro cliente (ownership)', async () => {
  const app = createTestApp();

  const clientA = await login(app, 'cliente@factorysaas.com', 'cliente123');
  const admin = await login(app, 'admin@factorysaas.com', 'admin123');

  const registerRes = await request(app)
    .post('/api/users/register')
    .send({
      name: 'Cliente Dos',
      email: `cliente2-${Date.now()}@factorysaas.com`,
      phone: '+573000000099',
      password: 'cliente123',
      whatsappConsent: true
    })
    .expect(201);

  const clientB = await login(app, registerRes.body.email, 'cliente123');

  const staffRes = await request(app).get('/api/users/public/staff').expect(200);
  const servicesRes = await request(app).get('/api/services?onlyActive=true').expect(200);

  assert.ok(staffRes.body.length > 0);
  assert.ok(servicesRes.body.length > 0);

  const startAt = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();

  const createAppointmentRes = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${clientA.token}`)
    .send({
      staffId: staffRes.body[0].id,
      serviceId: servicesRes.body[0].id,
      startAt,
      notes: 'ownership test'
    })
    .expect(201);

  const appointmentId = createAppointmentRes.body.id;

  await request(app)
    .post(`/api/appointments/${appointmentId}/cancel`)
    .set('Authorization', `Bearer ${clientB.token}`)
    .send({})
    .expect(403);

  await request(app)
    .post(`/api/appointments/${appointmentId}/cancel`)
    .set('Authorization', `Bearer ${admin.token}`)
    .send({})
    .expect(200);
});
