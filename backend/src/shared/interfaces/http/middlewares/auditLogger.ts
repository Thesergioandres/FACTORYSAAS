import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuditLogModel } from '../../../infrastructure/mongoose/models/AuditLogModel';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'DELETE']);
const REDACT_KEYS = new Set(['password', 'passwordHash', 'token', 'authorization', 'refreshToken']);

function sanitizeValue(value: unknown, depth: number): unknown {
  if (depth <= 0) return '[truncated]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Buffer) return '[buffer]';

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth - 1));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(record)) {
      if (REDACT_KEYS.has(key)) {
        sanitized[key] = '[redacted]';
      } else {
        sanitized[key] = sanitizeValue(val, depth - 1);
      }
    }
    return sanitized;
  }

  return String(value);
}

export function auditLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();

    res.on('finish', () => {
      if (!MUTATING_METHODS.has(method)) return;
      if (!req.auth?.sub) return;
      if (mongoose.connection.readyState !== 1) return;

      const details = {
        params: sanitizeValue(req.params, 3),
        query: sanitizeValue(req.query, 3),
        body: sanitizeValue(req.body, 3),
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('user-agent')
      };

      void AuditLogModel.create({
        userId: req.auth.sub,
        action: method,
        resource: req.originalUrl,
        details,
        timestamp: new Date()
      }).catch(() => undefined);
    });

    next();
  };
}
