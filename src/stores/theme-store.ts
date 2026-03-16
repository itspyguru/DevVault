import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeId } from "../themes";

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => {
        document.documentElement.dataset.theme = theme;
        set({ theme });
      },
    }),
    {
      name: "devvault-theme",
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.dataset.theme = state.theme;
        }
      },
    }
  )
);
