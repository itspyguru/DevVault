import { create } from "zustand";
import * as api from "../lib/tauri";

interface TagsState {
  allTags: string[];
  selectedTags: string[];
  fetchTags: () => Promise<void>;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
}

export const useTagsStore = create<TagsState>()((set, get) => ({
  allTags: [],
  selectedTags: [],

  fetchTags: async () => {
    try {
      const allTags = await api.getAllTags();
      set({ allTags });
    } catch {
      // ignore
    }
  },

  toggleTag: (tag) => {
    const { selectedTags } = get();
    if (selectedTags.includes(tag)) {
      set({ selectedTags: selectedTags.filter((t) => t !== tag) });
    } else {
      set({ selectedTags: [...selectedTags, tag] });
    }
  },

  clearTags: () => set({ selectedTags: [] }),
}));
