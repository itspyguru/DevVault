import { create } from "zustand";
import * as api from "../lib/tauri";
import type { Note, CreateNote, UpdateNote } from "../lib/tauri";

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  addNote: (data: CreateNote) => Promise<Note>;
  editNote: (id: string, data: UpdateNote) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await api.getNotes();
      set({ notes, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addNote: async (data) => {
    const note = await api.createNote(data);
    set({ notes: [note, ...get().notes] });
    return note;
  },

  editNote: async (id, data) => {
    const updated = await api.updateNote(id, data);
    set({
      notes: get().notes.map((n) => (n.id === id ? updated : n)),
    });
  },

  removeNote: async (id) => {
    await api.deleteNote(id);
    set({ notes: get().notes.filter((n) => n.id !== id) });
  },
}));
