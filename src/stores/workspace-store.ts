import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as api from "../lib/tauri";

interface WorkspaceState {
  companies: string[];
  selectedCompany: string;
  fetchCompanies: () => Promise<void>;
  setCompany: (company: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      companies: [],
      selectedCompany: "",

      fetchCompanies: async () => {
        try {
          const companies = await api.getCompanies();
          set({ companies });
        } catch {
          // ignore
        }
      },

      setCompany: (company) => set({ selectedCompany: company }),
    }),
    { name: "devvault-workspace" }
  )
);
