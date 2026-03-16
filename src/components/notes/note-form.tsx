import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { TagInput } from "@/components/tags/tag-input";
import type { Note, CreateNote, UpdateNote } from "@/lib/tauri";

interface NoteFormProps {
  note?: Note | null;
  onSubmit: (data: CreateNote | UpdateNote) => Promise<void>;
  onClose: () => void;
}

export function NoteForm({ note, onSubmit, onClose }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [company, setCompany] = useState(note?.company ?? "");
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSaving(true);
    try {
      await onSubmit({
        title, content,
        company: company || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      onClose();
    } finally { setSaving(false); }
  };

  const s = { backgroundColor: "var(--input-bg)", color: "var(--text-primary)", borderColor: "var(--border-color)", borderWidth: "1px" as const };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-lg max-h-[85vh] overflow-auto p-6 rounded-xl shadow-2xl" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", borderWidth: "1px" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{note ? "Edit Note" : "New Note"}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:opacity-80" style={{ color: "var(--text-secondary)" }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={s} required />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content (markdown supported) *" className="w-full px-3 py-2 rounded-lg text-xs outline-none font-mono resize-none" style={s} rows={10} required />
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company / Project" className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={s} />
          <TagInput tags={tags} onChange={setTags} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}>Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>{saving ? "Saving..." : note ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
