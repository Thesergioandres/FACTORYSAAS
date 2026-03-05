const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createTestApp } = require('./testAppFactory');

test('POST /api/auth/login devuelve token y usuario', async () => {
  const app = createTestApp();

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'cliente@factorysaas.com', password: 'cliente123' })
    .expect(200);

  assert.equal(typeof response.body.token, 'string');
  assert.equal(response.body.user.email, 'cliente@factorysaas.com');
  assert.equal(response.body.user.role, 'CLIENT');
});
