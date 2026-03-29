import { Router } from 'express';
import type { authenticateJwt } from '../../../../shared/interfaces/http/middlewares/authenticateJwt';
import type { createAuthController } from './authController';

export function createAuthRoutes({
  authController,
  authenticateJwt: authMiddleware
}: {
  authController: ReturnType<typeof createAuthController>;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
}) {
  const router = Router();
  router.post('/login', authController.login);
  router.post('/register-tenant', authController.registerTenant);
  router.post('/password/forgot', authController.forgotPassword);
  router.post('/password/reset', authController.resetPassword);
  router.get('/me', authMiddleware, authController.me);
  return router;
}
