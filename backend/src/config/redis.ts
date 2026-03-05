import IORedis from 'ioredis';
import { env } from './env';

const redisUrl = new URL(env.redisUrl);
const redisDb = redisUrl.pathname ? Number(redisUrl.pathname.slice(1)) : undefined;

export const redisConnectionOptions = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || '6379'),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  db: Number.isNaN(redisDb) ? undefined : redisDb,
  tls: redisUrl.protocol === 'rediss:' ? {} : undefined
};

export const redis = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableOfflineQueue: false
});

redis.on('error', () => {
  // Avoid unhandled error events when Redis is not running in dev.
});
