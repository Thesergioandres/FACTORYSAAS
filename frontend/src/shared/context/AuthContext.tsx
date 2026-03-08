import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../infrastructure/http/apiClient';
import { clearAuthToken, getAuthToken, isAuthTokenValid, setAuthToken } from '../infrastructure/http/session';

export type SessionUser = {
  id: string;
  name: string;
  role: 'GOD' | 'OWNER' | 'ADMIN' | 'STAFF' | 'CLIENT';
  email?: string;
  approved?: boolean;
  tenantId?: string;
};

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = getAuthToken();
    if (!token || !isAuthTokenValid(token)) {
      // Si no hay token o esta vencido, evitamos /auth/me y limpiamos la sesion local.
      if (token) {
        clearAuthToken();
      }
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await apiRequest<SessionUser>('/auth/me');
      setUser(me);
    } catch (_err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<{ token: string; user: SessionUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    setAuthToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
