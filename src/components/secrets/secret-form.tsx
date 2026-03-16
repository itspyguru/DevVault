import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { TagInput } from "@/components/tags/tag-input";
import type { Secret, CreateSecret, UpdateSecret } from "@/lib/tauri";

interface SecretFormProps {
  secret?: Secret | null;
  onSubmit: (data: CreateSecret | UpdateSecret) => Promise<void>;
  onClose: () => void;
}

export function SecretForm({ secret, onSubmit, onClose }: SecretFormProps) {
  const [title, setTitle] = useState(secret?.title ?? "");
  const [company, setCompany] = useState(secret?.company ?? "");
  const [environment, setEnvironment] = useState(secret?.environment ?? "dev");
  const [username, setUsername] = useState(secret?.username ?? "");
  const [secretValue, setSecretValue] = useState(secret?.secret ?? "");
  const [notes, setNotes] = useState(secret?.notes ?? "");
  const [tags, setTags] = useState<string[]>(secret?.tags ?? []);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !secretValue) return;
    setSaving(true);
    try {
      await onSubmit({
        title,
        company: company || undefined,
        environment,
        username: username || undefined,
        secret: secretValue,
        notes: notes || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--input-bg)",
    color: "var(--text-primary)",
    borderColor: "var(--border-color)",
    borderWidth: "1px",
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="w-full max-w-md max-h-[85vh] overflow-auto p-6 rounded-xl shadow-2xl"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--border-color)",
          borderWidth: "1px",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {secret ? "Edit Secret" : "New Secret"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title *"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={inputStyle}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company / Project"
              className="px-3 py-2 rounded-lg text-xs outline-none"
              style={inputStyle}
            />
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs outline-none"
              style={inputStyle}
            >
              <option value="dev">Development</option>
              <option value="staging">Staging</option>
              <option value="prod">Production</option>
            </select>
          </div>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username (optional)"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={inputStyle}
          />

          <textarea
            value={secretValue}
            onChange={(e) => setSecretValue(e.target.value)}
            placeholder="Secret / Password *"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none font-mono resize-none"
            style={inputStyle}
            rows={3}
            required
          />

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
            style={inputStyle}
            rows={2}
          />

          <TagInput tags={tags} onChange={setTags} />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-medium"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              {saving ? "Saving..." : secret ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
