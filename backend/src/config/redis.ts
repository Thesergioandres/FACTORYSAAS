import IORedis from 'ioredis';
import { env } from './env';

export const redis = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableOfflineQueue: false
});

redis.on('error', () => {
  // Avoid unhandled error events when Redis is not running in dev.
});
