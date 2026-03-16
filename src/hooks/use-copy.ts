import { useState, useCallback } from "react";
import { copyToClipboard } from "../lib/clipboard";

export function useCopy() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = useCallback(async (text: string, id?: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id ?? "default");
      setTimeout(() => setCopiedId(null), 2000);
    }
    return success;
  }, []);

  return { copy, copiedId };
}
