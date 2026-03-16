import { useState } from "react";
import { Trash2, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { TagBadge } from "@/components/tags/tag-badge";
import ReactMarkdown from "react-markdown";
import type { Note } from "@/lib/tauri";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);

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
        <div className="flex-1">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {note.title}
          </h3>
          {note.company && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{note.company}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <CopyButton text={note.content} id={`note-${note.id}`} />
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-md hover:opacity-80" style={{ color: "var(--text-secondary)" }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={() => onEdit(note)} className="p-1.5 rounded-md hover:opacity-80" style={{ color: "var(--text-secondary)" }}>
            <Edit size={14} />
          </button>
          <button onClick={() => onDelete(note.id)} className="p-1.5 rounded-md hover:opacity-80" style={{ color: "var(--danger)" }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div
        className={`text-xs overflow-hidden ${expanded ? "" : "line-clamp-2"}`}
        style={{ color: "var(--text-secondary)" }}
      >
        {expanded ? (
          <div className="prose prose-sm prose-invert max-w-none markdown-content" style={{ color: "var(--text-primary)" }}>
            <ReactMarkdown
              components={{
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  return isBlock ? (
                    <div className="relative">
                      <pre className="px-3 py-2 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: "var(--code-bg)" }}>
                        <code>{children}</code>
                      </pre>
                    </div>
                  ) : (
                    <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--code-bg)" }}>{children}</code>
                  );
                },
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>
        ) : (
          note.content
        )}
      </div>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
        </div>
      )}
    </div>
  );
}
