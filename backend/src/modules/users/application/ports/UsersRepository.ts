import type { UserRecord } from '../../domain/entities/User';
import type { UserRole } from '../../../../shared/domain/roles';

export type CreateUserInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  whatsappConsent?: boolean;
  approved?: boolean;
  tenantId?: string | null;
  branchIds?: string[];
};

export type UpdateUserInput = Partial<{
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  whatsappConsent: boolean;
  resetTokenHash: string | null;
  resetTokenExpiresAt: string | null;
  approved: boolean;
  tenantId: string | null;
  branchIds: string[];
}>;

export interface UsersRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findByResetToken(tokenHash: string): Promise<UserRecord | null>;
  listAll?(): Promise<UserRecord[]>;
  list(tenantId: string, role?: UserRole | string): Promise<UserRecord[]>;
  create(input: CreateUserInput): Promise<UserRecord>;
  update(id: string, input: UpdateUserInput): Promise<UserRecord | null>;
  updateWhatsappConsent(userId: string, whatsappConsent: boolean): Promise<UserRecord | null>;
  setResetToken(userId: string, tokenHash: string, expiresAt: string): Promise<UserRecord | null>;
  clearResetToken(userId: string): Promise<UserRecord | null>;
}
