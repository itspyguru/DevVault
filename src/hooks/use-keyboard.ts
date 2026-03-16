import { useEffect } from "react";
import { registerShortcut, unregisterShortcut } from "../lib/keyboard";

export function useKeyboard(key: string, handler: (e: KeyboardEvent) => void) {
  useEffect(() => {
    registerShortcut(key, handler);
    return () => unregisterShortcut(key);
  }, [key, handler]);
}
