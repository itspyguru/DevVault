import { useEffect, useState, useCallback } from "react";
import { FileText, Plus } from "lucide-react";
import { useNotesStore } from "@/stores/notes-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTagsStore } from "@/stores/tags-store";
import { NoteCard } from "@/components/notes/note-card";
import { NoteForm } from "@/components/notes/note-form";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TagFilter } from "@/components/tags/tag-filter";
import { registerShortcut, unregisterShortcut } from "@/lib/keyboard";
import type { Note, CreateNote, UpdateNote } from "@/lib/tauri";

export function NotesPage() {
  const { notes, fetchNotes, addNote, editNote, removeNote } = useNotesStore();
  const { selectedCompany } = useWorkspaceStore();
  const { selectedTags, fetchTags } = useTagsStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchNotes(); fetchTags(); }, [fetchNotes, fetchTags]);
  useEffect(() => {
    const handler = () => setShowForm(true);
    registerShortcut("Ctrl+n", handler);
    return () => unregisterShortcut("Ctrl+n");
  }, []);

  const handleCreate = useCallback(async (data: CreateNote | UpdateNote) => {
    await addNote(data as CreateNote); fetchTags();
  }, [addNote, fetchTags]);

  const handleEdit = useCallback(async (data: CreateNote | UpdateNote) => {
    if (editing) { await editNote(editing.id, data as UpdateNote); fetchTags(); }
  }, [editing, editNote, fetchTags]);

  const handleDelete = useCallback(async () => {
    if (deleteId) { await removeNote(deleteId); setDeleteId(null); fetchTags(); }
  }, [deleteId, removeNote, fetchTags]);

  const filtered = notes.filter((n) => {
    if (selectedCompany && n.company !== selectedCompany) return false;
    if (selectedTags.length > 0 && !selectedTags.some((t) => n.tags.includes(t))) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <TagFilter />
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
          <Plus size={14} /> Add Note
        </button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No notes yet" description="Quick notes for things you refer to often" action={{ label: "Add Note", onClick: () => setShowForm(true) }} />
      ) : (
        <div className="grid gap-3">{filtered.map((n) => <NoteCard key={n.id} note={n} onEdit={setEditing} onDelete={setDeleteId} />)}</div>
      )}
      {showForm && <NoteForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editing && <NoteForm note={editing} onSubmit={handleEdit} onClose={() => setEditing(null)} />}
      <ConfirmDialog isOpen={!!deleteId} title="Delete Note" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
