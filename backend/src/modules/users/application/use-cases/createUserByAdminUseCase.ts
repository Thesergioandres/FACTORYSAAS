import { UserRole } from '../../../../shared/domain/roles';
import type { UsersRepository } from '../ports/UsersRepository';

export class CreateUserByAdminUseCase {
  constructor(private readonly deps: { usersRepository: UsersRepository }) {}

  private error(message: string, statusCode: number) {
    return { error: message, statusCode };
  }

  private isE164(phone: string) {
    return /^\+[1-9]\d{7,14}$/.test(phone);
  }

  async execute({
    name,
    email,
    phone,
    password,
    role,
    tenantId,
    branchIds
  }: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: string;
    tenantId?: string;
    branchIds?: string[];
  }): Promise<{ user: Awaited<ReturnType<UsersRepository['create']>> } | { error: string; statusCode: number }> {
    if (!name || !email || !phone || !password || !role || !tenantId) {
      return this.error('name, email, phone, password, role y tenantId son requeridos', 400);
    }

    if (!this.isE164(phone)) {
      return this.error('phone debe estar en formato E.164', 400);
    }

    if (![UserRole.GOD, UserRole.ADMIN, UserRole.STAFF, UserRole.CLIENT].includes(role as UserRole)) {
      return this.error('role inválido', 400);
    }

    const existing = await this.deps.usersRepository.findByEmail(email);
    if (existing) {
      return this.error('email ya registrado', 409);
    }

    const user = await this.deps.usersRepository.create({
      name,
      email,
      phone,
      password,
      role: role as UserRole,
      whatsappConsent: true,
      approved: true,
      tenantId,
      branchIds: branchIds ?? []
    });

    return { user };
  }
}
