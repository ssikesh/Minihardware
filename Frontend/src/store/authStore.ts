import { create } from 'zustand';
import { authApi } from '../api/authApi';
import { LoginCredentials, RegisterCredentials, User, UserRole } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const savedUser = localStorage.getItem('minihardware_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('minihardware_token'),
  isAuthenticated: !!localStorage.getItem('minihardware_token'),
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem('minihardware_token', data.access_token);
      localStorage.setItem('minihardware_user', JSON.stringify(data.user));
      set({
        token: data.access_token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data.user;
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.register(credentials);
      localStorage.setItem('minihardware_token', data.access_token);
      localStorage.setItem('minihardware_user', JSON.stringify(data.user));
      set({
        token: data.access_token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data.user;
    } catch (err: any) {
      const errorMsg = err.message || 'Registration failed.';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('minihardware_token');
    localStorage.removeItem('minihardware_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('minihardware_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await authApi.getMe();
      localStorage.setItem('minihardware_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('minihardware_token');
      localStorage.removeItem('minihardware_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  isAdmin: () => {
    const user = get().user;
    return user?.role === 'ADMIN';
  },
}));

// Listen for global 401 unauthorized events to sync store
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().logout();
  });
}
