import { create } from "zustand";
import type { User, UserCreateRequest } from "../types/api";
import { authService } from "../services/authService";
import { extractErrorMessage } from "../lib/errorUtils";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserCreateRequest) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      const token = response.access_token;
      localStorage.setItem("token", token);
      set({ token, isAuthenticated: true, isLoading: false });
      await get().fetchMe();
    } catch (err: any) {
      set({ isLoading: false, error: extractErrorMessage(err) });
      throw err;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      const token = response.access_token;
      localStorage.setItem("token", token);
      set({
        token,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: extractErrorMessage(err) });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    try {
      const user = await authService.getMe();
      set({ user });
    } catch {
      get().logout();
    }
  },

  clearError: () => set({ error: null }),

  hydrate: () => {
    const token = localStorage.getItem("token");
    if (token) {
      set({ token, isAuthenticated: true });
      get().fetchMe();
    }
  },
}));
