import { create } from "zustand";
import * as api from "../lib/tauri";
import type { Command, CreateCommand, UpdateCommand } from "../lib/tauri";

interface CommandsState {
  commands: Command[];
  isLoading: boolean;
  error: string | null;
  fetchCommands: () => Promise<void>;
  addCommand: (data: CreateCommand) => Promise<Command>;
  editCommand: (id: string, data: UpdateCommand) => Promise<void>;
  removeCommand: (id: string) => Promise<void>;
}

export const useCommandsStore = create<CommandsState>()((set, get) => ({
  commands: [],
  isLoading: false,
  error: null,

  fetchCommands: async () => {
    set({ isLoading: true, error: null });
    try {
      const commands = await api.getCommands();
      set({ commands, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addCommand: async (data) => {
    const command = await api.createCommand(data);
    set({ commands: [command, ...get().commands] });
    return command;
  },

  editCommand: async (id, data) => {
    const updated = await api.updateCommand(id, data);
    set({
      commands: get().commands.map((c) => (c.id === id ? updated : c)),
    });
  },

  removeCommand: async (id) => {
    await api.deleteCommand(id);
    set({ commands: get().commands.filter((c) => c.id !== id) });
  },
}));
