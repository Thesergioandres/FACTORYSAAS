import { InMemoryStaffAvailabilityRepository } from './infrastructure/persistence/InMemoryStaffAvailabilityRepository';
import { MongoStaffAvailabilityRepository } from './infrastructure/persistence/MongoStaffAvailabilityRepository';
import { createStaffRoutes } from './interfaces/http/staffRoutes';
import type { authenticateJwt } from '../../shared/interfaces/http/middlewares/authenticateJwt';
import type { requireRoles } from '../../shared/interfaces/http/middlewares/requireRoles';
import type { requireApproved } from '../../shared/interfaces/http/middlewares/requireApproved';

export function createStaffModule({
  useMongo = false,
  authenticateJwt: authMiddleware,
  requireRoles: requireRolesMiddleware,
  requireApproved: requireApprovedMiddleware
}: {
  useMongo?: boolean;
  authenticateJwt: ReturnType<typeof authenticateJwt>;
  requireRoles: typeof requireRoles;
  requireApproved: ReturnType<typeof requireApproved>;
}) {
  const availabilityRepository = useMongo
    ? new MongoStaffAvailabilityRepository()
    : new InMemoryStaffAvailabilityRepository();
  const staffRoutes = createStaffRoutes({
    availabilityRepository,
    authenticateJwt: authMiddleware,
    requireApproved: requireApprovedMiddleware,
    requireRoles: requireRolesMiddleware
  });

  return { staffRoutes, availabilityRepository };
}
