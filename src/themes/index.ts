export const themes = [
  { id: "dark", name: "Dark", preview: "#1a1b26" },
  { id: "light", name: "Light", preview: "#ffffff" },
  { id: "dracula", name: "Dracula", preview: "#282a36" },
  { id: "nord", name: "Nord", preview: "#2e3440" },
  { id: "monokai", name: "Monokai", preview: "#272822" },
  { id: "solarized", name: "Solarized", preview: "#002b36" },
  { id: "github-dark", name: "GitHub Dark", preview: "#0d1117" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
