import { UserRole } from '../../../../shared/domain/roles';
import type { UsersRepository } from '../ports/UsersRepository';

function isE164(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export class RegisterClientUseCase {
  constructor(private readonly deps: { usersRepository: UsersRepository }) {}

  private error(message: string, statusCode: number) {
    return { error: message, statusCode };
  }

  async execute({
    name,
    email,
    phone,
    password,
    whatsappConsent = false,
    tenantId
  }: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    whatsappConsent?: boolean;
    tenantId?: string | null;
  }): Promise<{ user: Awaited<ReturnType<UsersRepository['create']>> } | { error: string; statusCode: number }> {
    if (!name || !email || !phone || !password) {
      return this.error('name, email, phone y password son requeridos', 400);
    }

    if (!isE164(phone)) {
      return this.error('phone debe estar en formato E.164', 400);
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
      role: UserRole.CLIENT,
      whatsappConsent,
      approved: false,
      tenantId: tenantId ?? null
    });

    return { user };
  }
}
