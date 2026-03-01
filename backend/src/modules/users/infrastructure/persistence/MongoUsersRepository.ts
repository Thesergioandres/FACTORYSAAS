import bcrypt from 'bcryptjs';
import { UserModel } from '../../../../shared/infrastructure/mongoose/models/UserModel';
import type { UsersRepository, CreateUserInput, UpdateUserInput } from '../../application/ports/UsersRepository';
import type { UserRecord } from '../../domain/entities/User';
import type { UserRole } from '../../../../shared/domain/roles';

function mapUser(document: {
  _id: { toString(): string };
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  whatsappConsent: boolean;
  approved: boolean;
  resetTokenHash?: string | null;
  resetTokenExpiresAt?: Date | string | null;
  tenantId?: string | null;
  branchIds?: string[];
  createdAt?: Date | string;
} | null): UserRecord | null {
  if (!document) {
    return null;
  }

  return {
    id: document._id.toString(),
    name: document.name,
    email: document.email,
    phone: document.phone,
    passwordHash: document.passwordHash,
    role: document.role,
    active: document.active,
    whatsappConsent: document.whatsappConsent,
    approved: document.approved,
    tenantId: document.tenantId ?? null,
    branchIds: document.branchIds ?? [],
    resetTokenHash: document.resetTokenHash ?? null,
    resetTokenExpiresAt: document.resetTokenExpiresAt instanceof Date
      ? document.resetTokenExpiresAt.toISOString()
      : document.resetTokenExpiresAt
      ? String(document.resetTokenExpiresAt)
      : null,
    createdAt: document.createdAt instanceof Date ? document.createdAt.toISOString() : String(document.createdAt)
  };
}

export class MongoUsersRepository implements UsersRepository {
  async listAll(): Promise<UserRecord[]> {
    const users = await UserModel.find({}).lean();
    return users.map((item) => mapUser(item as typeof item & { _id: { toString(): string } }) as UserRecord);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await UserModel.findOne({ email, active: true }).lean();
    return mapUser(user as typeof user & { _id: { toString(): string } });
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await UserModel.findById(id).lean();
    return mapUser(user as typeof user & { _id: { toString(): string } });
  }

  async list(tenantId: string, role?: UserRole | string): Promise<UserRecord[]> {
    const query: Record<string, unknown> = { tenantId };
    if (role) query.role = role;
    const users = await UserModel.find(query).lean();
    return users.map((item) => mapUser(item as typeof item & { _id: { toString(): string } }) as UserRecord);
  }

  async findByResetToken(tokenHash: string): Promise<UserRecord | null> {
    const user = await UserModel.findOne({ resetTokenHash: tokenHash, resetTokenExpiresAt: { $gt: new Date() } }).lean();
    return mapUser(user as typeof user & { _id: { toString(): string } });
  }

  async create(user: CreateUserInput): Promise<UserRecord> {
    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      phone: user.phone,
      passwordHash: bcrypt.hashSync(user.password, 10),
      role: user.role,
      active: true,
      whatsappConsent: user.whatsappConsent ?? false,
      approved: user.approved ?? true,
      tenantId: user.tenantId ?? null,
      branchIds: user.branchIds ?? []
    });

    return mapUser(doc.toObject() as typeof doc & { _id: { toString(): string } }) as UserRecord;
  }

  async update(id: string, payload: UpdateUserInput): Promise<UserRecord | null> {
    const update: Record<string, unknown> = {};
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.email !== undefined) update.email = payload.email;
    if (payload.phone !== undefined) update.phone = payload.phone;
    if (payload.passwordHash !== undefined) update.passwordHash = payload.passwordHash;
    if (payload.role !== undefined) update.role = payload.role;
    if (payload.active !== undefined) update.active = payload.active;
    if (payload.whatsappConsent !== undefined) update.whatsappConsent = payload.whatsappConsent;
    if (payload.approved !== undefined) update.approved = payload.approved;

    const updated = await UserModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return mapUser(updated as typeof updated & { _id: { toString(): string } });
  }

  async updateWhatsappConsent(userId: string, whatsappConsent: boolean): Promise<UserRecord | null> {
    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { whatsappConsent },
      { new: true }
    ).lean();

    return mapUser(updated as typeof updated & { _id: { toString(): string } });
  }

  async setResetToken(userId: string, tokenHash: string, expiresAt: string): Promise<UserRecord | null> {
    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { resetTokenHash: tokenHash, resetTokenExpiresAt: new Date(expiresAt) },
      { new: true }
    ).lean();

    return mapUser(updated as typeof updated & { _id: { toString(): string } });
  }

  async clearResetToken(userId: string): Promise<UserRecord | null> {
    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { resetTokenHash: null, resetTokenExpiresAt: null },
      { new: true }
    ).lean();

    return mapUser(updated as typeof updated & { _id: { toString(): string } });
  }
}
