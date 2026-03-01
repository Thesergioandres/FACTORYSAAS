import type { PasswordHasher } from '../ports/PasswordHasher';
import type { TokenService } from '../ports/TokenService';
import type { UserRepository } from '../ports/UserRepository';

export type LoginInput = {
  email?: string;
  password?: string;
};

type LoginError = {
  error: string;
  statusCode: number;
};

type LoginSuccess = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    whatsappConsent: boolean;
    approved: boolean;
    tenantId?: string | null;
  };
};

export class LoginUserUseCase {
  constructor(
    private readonly deps: {
      userRepository: UserRepository;
      passwordHasher: PasswordHasher;
      tokenService: TokenService;
    }
  ) {}

  async execute({ email, password }: LoginInput): Promise<LoginSuccess | LoginError> {
    if (!email || !password) {
      return { error: 'email y password son requeridos', statusCode: 400 };
    }

    const user = await this.deps.userRepository.findByEmail(email);
    if (!user) {
      return { error: 'Credenciales inválidas', statusCode: 401 };
    }

    const isValid = await this.deps.passwordHasher.compare(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Credenciales inválidas', statusCode: 401 };
    }

    const token = this.deps.tokenService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      approved: user.approved,
      tenantId: user.tenantId ?? undefined
    });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsappConsent: user.whatsappConsent,
        approved: user.approved,
        tenantId: user.tenantId ?? null
      }
    };
  }
}
