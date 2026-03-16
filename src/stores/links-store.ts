import { create } from "zustand";
import * as api from "../lib/tauri";
import type { Link, CreateLink, UpdateLink } from "../lib/tauri";

interface LinksState {
  links: Link[];
  isLoading: boolean;
  error: string | null;
  fetchLinks: () => Promise<void>;
  addLink: (data: CreateLink) => Promise<Link>;
  editLink: (id: string, data: UpdateLink) => Promise<void>;
  removeLink: (id: string) => Promise<void>;
}

export const useLinksStore = create<LinksState>()((set, get) => ({
  links: [],
  isLoading: false,
  error: null,

  fetchLinks: async () => {
    set({ isLoading: true, error: null });
    try {
      const links = await api.getLinks();
      set({ links, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addLink: async (data) => {
    const link = await api.createLink(data);
    set({ links: [link, ...get().links] });
    return link;
  },

  editLink: async (id, data) => {
    const updated = await api.updateLink(id, data);
    set({
      links: get().links.map((l) => (l.id === id ? updated : l)),
    });
  },

  removeLink: async (id) => {
    await api.deleteLink(id);
    set({ links: get().links.filter((l) => l.id !== id) });
  },
}));
