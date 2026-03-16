import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Trash2, Edit, User } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { TagBadge } from "@/components/tags/tag-badge";
import type { Secret } from "@/lib/tauri";

const envColors: Record<string, string> = {
  dev: "#3b82f6",
  staging: "#eab308",
  prod: "#ef4444",
};

interface SecretCardProps {
  secret: Secret;
  onEdit: (secret: Secret) => void;
  onDelete: (id: string) => void;
}

export function SecretCard({ secret, onEdit, onDelete }: SecretCardProps) {
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (revealed) {
      timerRef.current = setTimeout(() => setRevealed(false), 5000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [revealed]);

  return (
    <div
      className="p-4 rounded-xl transition-colors"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-color)",
        borderWidth: "1px",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {secret.title}
          </h3>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
            style={{
              backgroundColor: `${envColors[secret.environment] ?? envColors.dev}20`,
              color: envColors[secret.environment] ?? envColors.dev,
            }}
          >
            {secret.environment}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(secret)}
            className="p-1.5 rounded-md transition-colors hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(secret.id)}
            className="p-1.5 rounded-md transition-colors hover:opacity-80"
            style={{ color: "var(--danger)" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {secret.company && (
        <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
          {secret.company}
        </p>
      )}

      {secret.username && (
        <div className="flex items-center gap-2 mb-2">
          <User size={12} style={{ color: "var(--text-secondary)" }} />
          <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
            {secret.username}
          </span>
          <CopyButton text={secret.username} id={`user-${secret.id}`} size={12} />
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex-1 px-3 py-2 rounded-lg font-mono text-xs"
          style={{ backgroundColor: "var(--code-bg)", color: "var(--text-primary)" }}
        >
          {revealed ? secret.secret : "••••••••••••••••"}
        </div>
        <button
          onClick={() => setRevealed(!revealed)}
          className="p-1.5 rounded-md transition-colors hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <CopyButton text={secret.secret} id={`secret-${secret.id}`} />
      </div>

      {secret.notes && (
        <p
          className="text-xs mb-2 line-clamp-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {secret.notes}
        </p>
      )}

      {secret.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {secret.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
