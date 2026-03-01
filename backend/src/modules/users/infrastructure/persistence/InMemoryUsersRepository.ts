import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { database } from '../../../../shared/infrastructure/memory/database';
import type { UsersRepository, CreateUserInput, UpdateUserInput } from '../../application/ports/UsersRepository';
import type { UserRecord } from '../../domain/entities/User';
import type { UserRole } from '../../../../shared/domain/roles';

export class InMemoryUsersRepository implements UsersRepository {
  async listAll(): Promise<UserRecord[]> {
    return database.users.filter((user) => user.active) as unknown as UserRecord[];
  }

  async findById(id: string): Promise<UserRecord | null> {
    return database.users.find((user) => user.id === id && user.active) || null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return database.users.find((user) => user.email === email && user.active) || null;
  }

  async findByResetToken(tokenHash: string): Promise<UserRecord | null> {
    const now = Date.now();
    return database.users.find((user) => user.resetTokenHash === tokenHash && !!user.resetTokenExpiresAt && new Date(user.resetTokenExpiresAt).getTime() > now) || null;
  }

  async list(tenantId: string, role?: UserRole | string): Promise<UserRecord[]> {
    const filtered = database.users.filter(u => u.tenantId === tenantId);
    if (!role) {
      return filtered as unknown as UserRecord[];
    }
    return filtered.filter((user) => user.role === role) as unknown as UserRecord[];
  }

  async create({ name, email, phone, password, role, whatsappConsent = false, approved, tenantId, branchIds }: CreateUserInput): Promise<UserRecord> {
    const user: UserRecord = {
      id: randomUUID(),
      name,
      email,
      phone,
      passwordHash: bcrypt.hashSync(password, 10),
      role,
      active: true,
      whatsappConsent,
      approved: approved ?? true,
      tenantId: tenantId ?? null,
      branchIds: branchIds ?? [],
      createdAt: new Date().toISOString()
    };

    database.users.push(user as unknown as typeof database.users[0]);
    return user;
  }

  async update(id: string, payload: UpdateUserInput): Promise<UserRecord | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    if (payload.name !== undefined) user.name = payload.name;
    if (payload.email !== undefined) user.email = payload.email;
    if (payload.phone !== undefined) user.phone = payload.phone;
    if (payload.passwordHash !== undefined) user.passwordHash = payload.passwordHash;
    if (payload.role !== undefined) user.role = payload.role;
    if (payload.active !== undefined) user.active = payload.active;
    if (payload.whatsappConsent !== undefined) user.whatsappConsent = payload.whatsappConsent;
    if (payload.approved !== undefined) user.approved = payload.approved;
    if (payload.resetTokenHash !== undefined) user.resetTokenHash = payload.resetTokenHash;
    if (payload.resetTokenExpiresAt !== undefined) user.resetTokenExpiresAt = payload.resetTokenExpiresAt;

    return user;
  }

  async updateWhatsappConsent(userId: string, whatsappConsent: boolean): Promise<UserRecord | null> {
    const user = database.users.find((item) => item.id === userId);
    if (!user) {
      return null;
    }

    user.whatsappConsent = whatsappConsent;
    return user;
  }

  async setResetToken(userId: string, tokenHash: string, expiresAt: string): Promise<UserRecord | null> {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    user.resetTokenHash = tokenHash;
    user.resetTokenExpiresAt = expiresAt;
    return user;
  }

  async clearResetToken(userId: string): Promise<UserRecord | null> {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    return user;
  }
}
