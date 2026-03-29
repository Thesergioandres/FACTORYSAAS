import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IAuthUser } from '@/features/auth/types';

interface SessionState {
  user: IAuthUser | null;
  token: string | null;
  tenantConfig?: { primaryColor?: string; name?: string; slug?: string; logoUrl?: string };
  setSession: (user: IAuthUser, token: string, tenantConfig?: any) => void;
  updateTenantConfig: (config: any) => void;
  clearSession: () => void;
  getRole: () => string | null;
  getTenantId: () => string | null;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tenantConfig: undefined,
      setSession: (user, token, tenantConfig) => set({ user, token, tenantConfig }),
      updateTenantConfig: (config) => set((state) => ({ tenantConfig: { ...state.tenantConfig, ...config } })),
      clearSession: () => set({ user: null, token: null, tenantConfig: undefined }),
      getRole: () => get().user?.role || null,
      getTenantId: () => get().user?.tenantId || null,
    }),
    {
      name: 'session-store', // Guarda esto en localStorage (para propósitos del demo/B2B)
    }
  )
);
