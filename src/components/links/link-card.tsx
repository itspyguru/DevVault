import { Trash2, Edit, ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { TagBadge } from "@/components/tags/tag-badge";
import { truncate } from "@/lib/utils";
import type { Link } from "@/lib/tauri";

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
}

export function LinkCard({ link, onEdit, onDelete }: LinkCardProps) {
  const openUrl = () => {
    window.open(link.url, "_blank");
  };

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
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {link.title}
          </h3>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{ backgroundColor: "var(--tag-bg)", color: "var(--text-secondary)" }}
          >
            {link.category}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={openUrl} className="p-1.5 rounded-md hover:opacity-80" style={{ color: "var(--accent)" }} title="Open in browser">
            <ExternalLink size={14} />
          </button>
          <CopyButton text={link.url} id={`link-${link.id}`} />
          <button onClick={() => onEdit(link)} className="p-1.5 rounded-md hover:opacity-80" style={{ color: "var(--text-secondary)" }}>
            <Edit size={14} />
          </button>
          <button onClick={() => onDelete(link.id)} className="p-1.5 rounded-md hover:opacity-80" style={{ color: "var(--danger)" }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-xs font-mono mb-2" style={{ color: "var(--text-secondary)" }}>
        {truncate(link.url, 60)}
      </p>

      {link.company && (
        <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>{link.company}</p>
      )}

      {link.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {link.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
        </div>
      )}
    </div>
  );
}
