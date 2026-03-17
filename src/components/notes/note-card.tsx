import { Trash2, Edit, Copy, Check } from "lucide-react";
import { TagBadge } from "@/components/tags/tag-badge";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Note } from "@/lib/tauri";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="rounded-xl break-inside-avoid mb-3 overflow-hidden flex flex-col"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-color)",
        borderWidth: "1px",
      }}
    >
      {/* Header strip with workspace color accent */}
      <div className="px-3 pt-3 pb-2 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {note.title}
          </h3>
          {note.company && (
            <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
              {note.company}
            </p>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
            title="Copy content"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-1 rounded hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
            title="Edit"
          >
            <Edit size={12} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 rounded hover:opacity-80"
            style={{ color: "var(--danger)" }}
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Markdown content */}
      <div
        className="px-3 pb-3 text-xs note-markdown overflow-hidden"
        style={{ color: "var(--text-primary)" }}
      >
        <ReactMarkdown
          components={{
            code: ({ children, className, ...rest }) => {
              const match = /language-(\w+)/.exec(className || "");
              const code = String(children).replace(/\n$/, "");
              return match ? (
                <div className="relative my-2 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between px-3 py-1"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                      {match[1]}
                    </span>
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "0.75rem",
                      fontSize: "11px",
                      lineHeight: "1.5",
                      borderRadius: "0 0 0.5rem 0.5rem",
                      background: "var(--code-bg)",
                    }}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code
                  className="px-1 py-0.5 rounded text-[11px]"
                  style={{ backgroundColor: "var(--code-bg)" }}
                  {...rest}
                >
                  {children}
                </code>
              );
            },
            p: ({ children }) => (
              <p className="my-1.5 leading-relaxed">{children}</p>
            ),
            h1: ({ children }) => (
              <h1 className="text-base font-bold mt-3 mb-1.5" style={{ color: "var(--text-primary)" }}>{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-sm font-bold mt-2.5 mb-1" style={{ color: "var(--text-primary)" }}>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xs font-bold mt-2 mb-1" style={{ color: "var(--text-primary)" }}>{children}</h3>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside my-1.5 space-y-0.5">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside my-1.5 space-y-0.5">{children}</ol>
            ),
            blockquote: ({ children }) => (
              <blockquote
                className="pl-3 my-2 text-xs italic"
                style={{ borderLeft: "3px solid var(--accent)", color: "var(--text-secondary)" }}
              >
                {children}
              </blockquote>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "var(--accent)" }}
              >
                {children}
              </a>
            ),
            hr: () => (
              <hr className="my-2" style={{ borderColor: "var(--border-color)" }} />
            ),
          }}
        >
          {note.content}
        </ReactMarkdown>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div
          className="px-3 pb-2.5 flex flex-wrap gap-1"
          style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem" }}
        >
          {note.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
