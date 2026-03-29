import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../services/auth.service';
import { useSessionStore } from '@/shared/store/useSessionStore';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(email, password);
      
      // Guardar en el estado global (Zustand)
      setSession(response.user, response.token, response.tenantConfig);

      // Evaluar Onboarding
      if (
        response.user.role === 'ADMIN' &&
        (!response.tenantConfig?.businessProfile?.name || 
          response.tenantConfig?.slug?.match(/-[0-9]{1,4}$/) ||
          response.tenantConfig?.status === 'onboarding')
      ) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard/pos');
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado al iniciar sesión.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
