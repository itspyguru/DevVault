import { useEffect, useState, useCallback } from "react";
import { Terminal, Plus } from "lucide-react";
import { useCommandsStore } from "@/stores/commands-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTagsStore } from "@/stores/tags-store";
import { CommandCard } from "@/components/commands/command-card";
import { CommandForm } from "@/components/commands/command-form";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TagFilter } from "@/components/tags/tag-filter";
import { registerShortcut, unregisterShortcut } from "@/lib/keyboard";
import type { Command, CreateCommand, UpdateCommand } from "@/lib/tauri";

export function CommandsPage() {
  const { commands, fetchCommands, addCommand, editCommand, removeCommand } =
    useCommandsStore();
  const { selectedCompany } = useWorkspaceStore();
  const { selectedTags, fetchTags } = useTagsStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Command | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCommands();
    fetchTags();
  }, [fetchCommands, fetchTags]);

  useEffect(() => {
    const handler = () => setShowForm(true);
    registerShortcut("Ctrl+n", handler);
    return () => unregisterShortcut("Ctrl+n");
  }, []);

  const handleCreate = useCallback(async (data: CreateCommand | UpdateCommand) => {
    await addCommand(data as CreateCommand);
    fetchTags();
  }, [addCommand, fetchTags]);

  const handleEdit = useCallback(async (data: CreateCommand | UpdateCommand) => {
    if (editing) { await editCommand(editing.id, data as UpdateCommand); fetchTags(); }
  }, [editing, editCommand, fetchTags]);

  const handleDelete = useCallback(async () => {
    if (deleteId) { await removeCommand(deleteId); setDeleteId(null); fetchTags(); }
  }, [deleteId, removeCommand, fetchTags]);

  const filtered = commands.filter((c) => {
    if (selectedCompany && c.company !== selectedCompany) return false;
    if (selectedTags.length > 0 && !selectedTags.some((t) => c.tags.includes(t))) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <TagFilter />
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
          <Plus size={14} /> Add Command
        </button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Terminal} title="No commands yet" description="Save commands you use often" action={{ label: "Add Command", onClick: () => setShowForm(true) }} />
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <CommandCard key={c.id} command={c} onEdit={setEditing} onDelete={setDeleteId} />
          ))}
        </div>
      )}
      {showForm && <CommandForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editing && <CommandForm command={editing} onSubmit={handleEdit} onClose={() => setEditing(null)} />}
      <ConfirmDialog isOpen={!!deleteId} title="Delete Command" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
