import dotenv from 'dotenv';
import type { SignOptions } from 'jsonwebtoken';

dotenv.config();

export type Env = {
  nodeEnv: string;
  logLevel: string;
  port: number;
  mongodbUri: string;
  useMongo: boolean;
  redisUrl: string;
  enableJobs: boolean;
  trustProxy: boolean;
  apiRateLimitWindowMs: number;
  apiRateLimitMax: number;
  corsOrigins: string[];
  whatsappProvider: string;
  jwtSecret: string;
  jwtExpiresIn: SignOptions['expiresIn'];
  minAdvanceMinutes: number;
  cancelLimitMinutes: number;
  rescheduleLimitMinutes: number;
  quietHoursStart: string;
  quietHoursEnd: string;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  vapidPublicKey?: string;
  vapidPrivateKey?: string;
  vapidSubject?: string;
};

const nodeEnv = process.env.NODE_ENV || 'development';
const defaultEnableJobs = nodeEnv === 'production' ? 'true' : 'false';

export const env: Env = {
  nodeEnv,
  logLevel: process.env.LOG_LEVEL || 'info',
  port: Number(process.env.PORT || 4000),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/factorysaas',
  useMongo: (process.env.USE_MONGO || 'true') === 'true',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  enableJobs: (process.env.ENABLE_JOBS || defaultEnableJobs) === 'true',
  trustProxy: (process.env.TRUST_PROXY || 'true') === 'true',
  apiRateLimitWindowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 60000),
  apiRateLimitMax: Number(process.env.API_RATE_LIMIT_MAX || 120),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((item: string) => item.trim())
    .filter(Boolean),
  whatsappProvider: process.env.WHATSAPP_PROVIDER || 'mock',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '1d') as SignOptions['expiresIn'],
  minAdvanceMinutes: Number(process.env.MIN_ADVANCE_MINUTES || 60),
  cancelLimitMinutes: Number(process.env.CANCEL_LIMIT_MINUTES || 120),
  rescheduleLimitMinutes: Number(process.env.RESCHEDULE_LIMIT_MINUTES || 120),
  quietHoursStart: process.env.QUIET_HOURS_START || '22:00',
  quietHoursEnd: process.env.QUIET_HOURS_END || '07:00',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  vapidSubject: process.env.VAPID_SUBJECT
};
