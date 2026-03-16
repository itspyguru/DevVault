import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { TagInput } from "@/components/tags/tag-input";
import type { Command, CreateCommand, UpdateCommand } from "@/lib/tauri";

interface CommandFormProps {
  command?: Command | null;
  onSubmit: (data: CreateCommand | UpdateCommand) => Promise<void>;
  onClose: () => void;
}

export function CommandForm({ command, onSubmit, onClose }: CommandFormProps) {
  const [title, setTitle] = useState(command?.title ?? "");
  const [cmd, setCmd] = useState(command?.command ?? "");
  const [description, setDescription] = useState(command?.description ?? "");
  const [company, setCompany] = useState(command?.company ?? "");
  const [tags, setTags] = useState<string[]>(command?.tags ?? []);
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
    if (!title || !cmd) return;
    setSaving(true);
    try {
      await onSubmit({
        title, command: cmd,
        description: description || undefined,
        company: company || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      onClose();
    } finally { setSaving(false); }
  };

  const s = { backgroundColor: "var(--input-bg)", color: "var(--text-primary)", borderColor: "var(--border-color)", borderWidth: "1px" as const };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-md max-h-[85vh] overflow-auto p-6 rounded-xl shadow-2xl" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", borderWidth: "1px" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{command ? "Edit Command" : "New Command"}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:opacity-80" style={{ color: "var(--text-secondary)" }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={s} required />
          <textarea value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder="Command *" className="w-full px-3 py-2 rounded-lg text-xs outline-none font-mono resize-none" style={s} rows={4} required />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={s} />
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company / Project" className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={s} />
          <TagInput tags={tags} onChange={setTags} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}>Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>{saving ? "Saving..." : command ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
