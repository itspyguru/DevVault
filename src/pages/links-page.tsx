import { useEffect, useState, useCallback } from "react";
import { Link2, Plus } from "lucide-react";
import { useLinksStore } from "@/stores/links-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTagsStore } from "@/stores/tags-store";
import { LinkCard } from "@/components/links/link-card";
import { LinkForm } from "@/components/links/link-form";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TagFilter } from "@/components/tags/tag-filter";
import { registerShortcut, unregisterShortcut } from "@/lib/keyboard";
import type { Link, CreateLink, UpdateLink } from "@/lib/tauri";

export function LinksPage() {
  const { links, fetchLinks, addLink, editLink, removeLink } = useLinksStore();
  const { selectedCompany } = useWorkspaceStore();
  const { selectedTags, fetchTags } = useTagsStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Link | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchLinks(); fetchTags(); }, [fetchLinks, fetchTags]);
  useEffect(() => {
    const handler = () => setShowForm(true);
    registerShortcut("Ctrl+n", handler);
    return () => unregisterShortcut("Ctrl+n");
  }, []);

  const handleCreate = useCallback(async (data: CreateLink | UpdateLink) => {
    await addLink(data as CreateLink); fetchTags();
  }, [addLink, fetchTags]);

  const handleEdit = useCallback(async (data: CreateLink | UpdateLink) => {
    if (editing) { await editLink(editing.id, data as UpdateLink); fetchTags(); }
  }, [editing, editLink, fetchTags]);

  const handleDelete = useCallback(async () => {
    if (deleteId) { await removeLink(deleteId); setDeleteId(null); fetchTags(); }
  }, [deleteId, removeLink, fetchTags]);

  const filtered = links.filter((l) => {
    if (selectedCompany && l.company !== selectedCompany) return false;
    if (selectedTags.length > 0 && !selectedTags.some((t) => l.tags.includes(t))) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <TagFilter />
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
          <Plus size={14} /> Add Link
        </button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Link2} title="No links yet" description="Bookmark useful URLs and documentation" action={{ label: "Add Link", onClick: () => setShowForm(true) }} />
      ) : (
        <div className="grid gap-3">{filtered.map((l) => <LinkCard key={l.id} link={l} onEdit={setEditing} onDelete={setDeleteId} />)}</div>
      )}
      {showForm && <LinkForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editing && <LinkForm link={editing} onSubmit={handleEdit} onClose={() => setEditing(null)} />}
      <ConfirmDialog isOpen={!!deleteId} title="Delete Link" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
