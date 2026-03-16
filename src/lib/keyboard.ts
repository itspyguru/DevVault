type KeyHandler = (e: KeyboardEvent) => void;

const handlers = new Map<string, KeyHandler>();

export function registerShortcut(key: string, handler: KeyHandler) {
  handlers.set(key, handler);
}

export function unregisterShortcut(key: string) {
  handlers.delete(key);
}

function getShortcutKey(e: KeyboardEvent): string | null {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push("Ctrl");
  if (e.shiftKey) parts.push("Shift");
  if (e.altKey) parts.push("Alt");

  if (e.key === "Escape") return "Escape";
  if (e.key >= "1" && e.key <= "9" && parts.length > 0)
    return `${parts.join("+")}+${e.key}`;
  if (e.key === "k" && parts.includes("Ctrl")) return "Ctrl+k";
  if (e.key === "n" && parts.includes("Ctrl")) return "Ctrl+n";
  if (e.key === "l" && parts.includes("Ctrl")) return "Ctrl+l";
  if (e.key === "," && parts.includes("Ctrl")) return "Ctrl+,";
  if (e.key === "Enter" && parts.includes("Ctrl")) return "Ctrl+Enter";

  return null;
}

export function initKeyboardListener() {
  document.addEventListener("keydown", (e) => {
    const key = getShortcutKey(e);
    if (key && handlers.has(key)) {
      e.preventDefault();
      handlers.get(key)!(e);
    }
  });
}
