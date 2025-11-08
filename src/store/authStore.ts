import { create } from 'zustand';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    // Check if token exists in localStorage on app initialization
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        api.setToken(token);
        // Verify token by fetching user
        useAuthStore.getState().checkAuth();
      }
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.login({ email, password });
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }
      
      api.setToken(data.token);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({
        error: err.response?.data?.error || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.register({ name, email, password });
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }
      
      api.setToken(data.token);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({
        error: err.response?.data?.error || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    
    api.setToken('');
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      api.setToken(token);
      const data = await api.getMe();
      
      // Update user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      set({
        user: data.user,
        isAuthenticated: true,
      });
    } catch {
      // Token is invalid, clear everything
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      api.setToken('');
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
