import { create } from 'zustand';
import { z } from 'zod';
import { api, clearAuthToken, getAuthToken, setAuthToken } from '../lib/api';

const authUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1)
});

export type AuthUser = z.infer<typeof authUserSchema>;

async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await api.get('/auth/me');
  return authUserSchema.parse(response.data);
}

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  isInitializing: boolean;
  initializeAuth: () => Promise<void>;
  loginWithToken: (token: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isInitializing: true,

  initializeAuth: async () => {
    const token = getAuthToken();

    if (!token) {
      set({ token: null, user: null, isInitializing: false });
      return;
    }

    set({ token, isInitializing: true });

    try {
      const user = await fetchCurrentUser();
      set({ token, user, isInitializing: false });
    } catch {
      clearAuthToken();
      set({ token: null, user: null, isInitializing: false });
    }
  },

  loginWithToken: async (token: string) => {
    setAuthToken(token);
    set({ token, isInitializing: true });

    try {
      const user = await fetchCurrentUser();
      set({ token, user, isInitializing: false });
      return true;
    } catch {
      clearAuthToken();
      set({ token: null, user: null, isInitializing: false });
      return false;
    }
  },

  logout: () => {
    clearAuthToken();
    set({ token: null, user: null, isInitializing: false });
  }
}));
