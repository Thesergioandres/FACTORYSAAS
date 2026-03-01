import type { UserRole } from '../../../../shared/domain/roles';

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  approved: boolean;
  tenantId?: string;
};

export interface TokenService {
  sign(payload: AuthTokenPayload): string;
}
