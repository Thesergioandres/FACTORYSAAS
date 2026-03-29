import { AuthResponse } from '../types';

export class AuthService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error en autenticación. Verifica tus credenciales.');
    }

    return response.json();
  }
}
