import { create } from "zustand";
import * as api from "../lib/tauri";

interface AuthState {
  isUnlocked: boolean;
  hasPassword: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  setup: (password: string) => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isUnlocked: false,
  hasPassword: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    try {
      const hasPassword = await api.checkHasPassword();
      const unlocked = await api.isUnlocked();
      set({ hasPassword, isUnlocked: unlocked, isLoading: false, error: null });
    } catch (e) {
      set({ isLoading: false, error: String(e) });
    }
  },

  setup: async (password) => {
    try {
      set({ error: null });
      await api.setupPassword(password);
      set({ hasPassword: true, isUnlocked: true });
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  unlock: async (password) => {
    try {
      set({ error: null });
      const success = await api.unlockVault(password);
      if (success) {
        set({ isUnlocked: true });
      } else {
        set({ error: "Incorrect password" });
      }
      return success;
    } catch (e) {
      set({ error: String(e) });
      return false;
    }
  },

  lock: async () => {
    try {
      await api.lockVault();
      set({ isUnlocked: false });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      set({ error: null });
      await api.changePassword(oldPassword, newPassword);
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },
}));
