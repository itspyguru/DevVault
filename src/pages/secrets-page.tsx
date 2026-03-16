import { useEffect, useState, useCallback } from "react";
import { Shield, Plus } from "lucide-react";
import { useVaultStore } from "@/stores/vault-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTagsStore } from "@/stores/tags-store";
import { SecretsList } from "@/components/secrets/secrets-list";
import { SecretForm } from "@/components/secrets/secret-form";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TagFilter } from "@/components/tags/tag-filter";
import { registerShortcut, unregisterShortcut } from "@/lib/keyboard";
import type { Secret, CreateSecret, UpdateSecret } from "@/lib/tauri";

export function SecretsPage() {
  const { secrets, fetchSecrets, addSecret, editSecret, removeSecret } =
    useVaultStore();
  const { selectedCompany } = useWorkspaceStore();
  const { selectedTags, fetchTags } = useTagsStore();
  const [showForm, setShowForm] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSecrets();
    fetchTags();
  }, [fetchSecrets, fetchTags]);

  useEffect(() => {
    const handler = () => setShowForm(true);
    registerShortcut("Ctrl+n", handler);
    return () => unregisterShortcut("Ctrl+n");
  }, []);

  const handleCreate = useCallback(
    async (data: CreateSecret | UpdateSecret) => {
      await addSecret(data as CreateSecret);
      fetchTags();
    },
    [addSecret, fetchTags]
  );

  const handleEdit = useCallback(
    async (data: CreateSecret | UpdateSecret) => {
      if (editingSecret) {
        await editSecret(editingSecret.id, data as UpdateSecret);
        fetchTags();
      }
    },
    [editingSecret, editSecret, fetchTags]
  );

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      await removeSecret(deleteId);
      setDeleteId(null);
      fetchTags();
    }
  }, [deleteId, removeSecret, fetchTags]);

  const filtered = secrets.filter((s) => {
    if (selectedCompany && s.company !== selectedCompany) return false;
    if (
      selectedTags.length > 0 &&
      !selectedTags.some((t) => s.tags.includes(t))
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <TagFilter />
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
        >
          <Plus size={14} />
          Add Secret
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No secrets yet"
          description="Store your API keys, tokens, and passwords securely"
          action={{ label: "Add Secret", onClick: () => setShowForm(true) }}
        />
      ) : (
        <SecretsList
          secrets={filtered}
          onEdit={(s) => setEditingSecret(s)}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {showForm && (
        <SecretForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingSecret && (
        <SecretForm
          secret={editingSecret}
          onSubmit={handleEdit}
          onClose={() => setEditingSecret(null)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Secret"
        message="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
