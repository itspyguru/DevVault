import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as api from "../lib/tauri";
import type { Workspace } from "../lib/tauri";

interface WorkspaceState {
  workspaces: Workspace[];
  selectedWorkspace: string; // workspace name, "" = all
  fetchWorkspaces: () => Promise<void>;
  setWorkspace: (name: string) => void;
  createWorkspace: (name: string, color?: string) => Promise<Workspace>;
  updateWorkspace: (id: string, name?: string, color?: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  // Keep backward compat
  companies: string[];
  selectedCompany: string;
  fetchCompanies: () => Promise<void>;
  setCompany: (company: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      selectedWorkspace: "",
      companies: [],
      selectedCompany: "",

      fetchWorkspaces: async () => {
        try {
          const workspaces = await api.getWorkspaces();
          const companies = workspaces.map((w) => w.name);
          set({ workspaces, companies });
        } catch {
          // ignore
        }
      },

      setWorkspace: (name) => set({ selectedWorkspace: name, selectedCompany: name }),

      createWorkspace: async (name, color) => {
        const ws = await api.createWorkspace({ name, color });
        await get().fetchWorkspaces();
        return ws;
      },

      updateWorkspace: async (id, name, color) => {
        await api.updateWorkspace(id, { name, color });
        await get().fetchWorkspaces();
      },

      deleteWorkspace: async (id) => {
        const ws = get().workspaces.find((w) => w.id === id);
        await api.deleteWorkspace(id);
        // If deleted workspace was selected, reset to all
        if (ws && get().selectedWorkspace === ws.name) {
          set({ selectedWorkspace: "", selectedCompany: "" });
        }
        await get().fetchWorkspaces();
      },

      // Backward compat
      fetchCompanies: async () => {
        await get().fetchWorkspaces();
      },
      setCompany: (company) => set({ selectedCompany: company, selectedWorkspace: company }),
    }),
    { name: "devvault-workspace" }
  )
);
