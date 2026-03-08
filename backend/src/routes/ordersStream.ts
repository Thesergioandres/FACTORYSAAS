import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Env } from '../config/env';
import type { AuthPayload } from '../shared/types/auth';
import { addKitchenSubscriber, removeKitchenSubscriber } from '../shared/infrastructure/realtime/ordersHub';

function isAuthPayload(payload: jwt.JwtPayload | string): payload is jwt.JwtPayload & AuthPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const candidate = payload as jwt.JwtPayload & Partial<AuthPayload>;
  return typeof candidate.sub === 'string' && typeof candidate.role === 'string' && typeof candidate.approved === 'boolean';
}

function getTokenFromRequest(req: Request) {
  const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
  if (queryToken) return queryToken;
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme === 'Bearer' && token) return token;
  return undefined;
}

export function createOrdersStreamRoutes({ env }: { env: Env }) {
  const router = Router();

  router.get('/stream', (req: Request, res: Response) => {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: 'Token requerido' });

    try {
      const payload = jwt.verify(token, env.jwtSecret);
      if (!isAuthPayload(payload)) {
        return res.status(401).json({ message: 'Token invalido' });
      }

      const tenantId = payload.tenantId;
      if (!tenantId) {
        return res.status(403).json({ message: 'No tenantId' });
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      res.write(`event: connected\ndata: {"tenantId":"${tenantId}"}\n\n`);

      addKitchenSubscriber(tenantId, res);

      const keepAlive = setInterval(() => {
        res.write('event: ping\ndata: {}\n\n');
      }, 25000);

      req.on('close', () => {
        clearInterval(keepAlive);
        removeKitchenSubscriber(tenantId, res);
      });

      return undefined;
    } catch (_error) {
      return res.status(401).json({ message: 'Token invalido' });
    }
  });

  return { ordersRoutes: router };
}
