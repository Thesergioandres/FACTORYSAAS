const { createApp } = require('../../src/app/createApp');
const { database } = require('../../src/shared/infrastructure/memory/database');
const { createLogger } = require('../../src/shared/infrastructure/logging/logger');

function createTestEnv() {
  return {
    nodeEnv: 'test',
    port: 0,
    mongodbUri: 'mongodb://localhost:27017/factorysaas_test',
    useMongo: false,
    redisUrl: 'redis://localhost:6379',
    enableJobs: false,
    trustProxy: false,
    apiRateLimitWindowMs: 60000,
    apiRateLimitMax: 1000,
    corsOrigins: ['http://localhost:5173'],
    jwtSecret: 'test-secret',
    jwtExpiresIn: '1d',
    minAdvanceMinutes: 60,
    cancelLimitMinutes: 120,
    rescheduleLimitMinutes: 120,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  };
}

function resetInMemoryState() {
  database.whatsappLogs.length = 0;
}

function createTestApp() {
  resetInMemoryState();
  return createApp({
    env: createTestEnv(),
    logger: createLogger({ level: 'silent', nodeEnv: 'test' }),
    persistence: { useMongo: false }
  });
}

module.exports = { createTestApp };
