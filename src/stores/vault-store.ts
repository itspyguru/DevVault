import { create } from "zustand";
import * as api from "../lib/tauri";
import type { Secret, CreateSecret, UpdateSecret } from "../lib/tauri";

interface VaultState {
  secrets: Secret[];
  isLoading: boolean;
  error: string | null;
  fetchSecrets: () => Promise<void>;
  addSecret: (data: CreateSecret) => Promise<Secret>;
  editSecret: (id: string, data: UpdateSecret) => Promise<void>;
  removeSecret: (id: string) => Promise<void>;
}

export const useVaultStore = create<VaultState>()((set, get) => ({
  secrets: [],
  isLoading: false,
  error: null,

  fetchSecrets: async () => {
    set({ isLoading: true, error: null });
    try {
      const secrets = await api.getSecrets();
      set({ secrets, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addSecret: async (data) => {
    const secret = await api.createSecret(data);
    set({ secrets: [secret, ...get().secrets] });
    return secret;
  },

  editSecret: async (id, data) => {
    const updated = await api.updateSecret(id, data);
    set({
      secrets: get().secrets.map((s) => (s.id === id ? updated : s)),
    });
  },

  removeSecret: async (id) => {
    await api.deleteSecret(id);
    set({ secrets: get().secrets.filter((s) => s.id !== id) });
  },
}));
