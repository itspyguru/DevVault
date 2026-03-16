import { Trash2, Edit } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { TagBadge } from "@/components/tags/tag-badge";
import type { Command } from "@/lib/tauri";

interface CommandCardProps {
  command: Command;
  onEdit: (command: Command) => void;
  onDelete: (id: string) => void;
}

export function CommandCard({ command, onEdit, onDelete }: CommandCardProps) {
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
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {command.title}
          </h3>
          {command.company && (
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-secondary)" }}
            >
              {command.company}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(command)}
            className="p-1.5 rounded-md hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(command.id)}
            className="p-1.5 rounded-md hover:opacity-80"
            style={{ color: "var(--danger)" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="relative mb-3">
        <pre
          className="px-3 py-2 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap"
          style={{
            backgroundColor: "var(--code-bg)",
            color: "var(--text-primary)",
          }}
        >
          {command.command}
        </pre>
        <div className="absolute top-1 right-1">
          <CopyButton text={command.command} id={`cmd-${command.id}`} />
        </div>
      </div>

      {command.description && (
        <p
          className="text-xs mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {command.description}
        </p>
      )}

      {command.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {command.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
