import { Copy, Check } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";

interface CopyButtonProps {
  text: string;
  id?: string;
  size?: number;
  className?: string;
}

export function CopyButton({ text, id, size = 14, className }: CopyButtonProps) {
  const { copy, copiedId } = useCopy();
  const isCopied = copiedId === (id ?? "default");

  return (
    <button
      onClick={() => copy(text, id)}
      className={`p-1.5 rounded-md transition-colors hover:opacity-80 ${className ?? ""}`}
      style={{ color: isCopied ? 'var(--success)' : 'var(--text-secondary)' }}
      title="Copy"
    >
      {isCopied ? <Check size={size} /> : <Copy size={size} />}
    </button>
  );
}
