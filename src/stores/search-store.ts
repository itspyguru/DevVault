import { create } from "zustand";
import * as api from "../lib/tauri";
import type { SearchResult } from "../lib/tauri";

interface SearchState {
  query: string;
  results: SearchResult[];
  isOpen: boolean;
  isSearching: boolean;
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useSearchStore = create<SearchState>()((set, get) => ({
  query: "",
  results: [],
  isOpen: false,
  isSearching: false,

  setQuery: (query) => set({ query }),

  search: async (query) => {
    if (!query.trim()) {
      set({ results: [], isSearching: false });
      return;
    }
    set({ isSearching: true });
    try {
      const results = await api.globalSearch(query);
      set({ results, isSearching: false });
    } catch {
      set({ results: [], isSearching: false });
    }
  },

  open: () => set({ isOpen: true, query: "", results: [] }),
  close: () => set({ isOpen: false, query: "", results: [] }),
  toggle: () => {
    const { isOpen } = get();
    if (isOpen) {
      set({ isOpen: false, query: "", results: [] });
    } else {
      set({ isOpen: true, query: "", results: [] });
    }
  },
}));
