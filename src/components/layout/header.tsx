import { useState } from "react";
import { Search, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useSearchStore } from "@/stores/search-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

const WORKSPACE_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ef4444", "#14b8a6", "#f97316", "#06b6d4",
];

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { open } = useSearchStore();
  const {
    workspaces, selectedWorkspace, setWorkspace,
    createWorkspace, updateWorkspace, deleteWorkspace,
  } = useWorkspaceStore();
  const [showManager, setShowManager] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(WORKSPACE_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await createWorkspace(name, newColor);
      setNewName("");
      setNewColor(WORKSPACE_COLORS[0]);
    } catch {
      // name might already exist
    }
  };

  const handleUpdate = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    await updateWorkspace(id, name, editColor);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteWorkspace(id);
  };

  const startEdit = (ws: { id: string; name: string; color: string }) => {
    setEditingId(ws.id);
    setEditName(ws.name);
    setEditColor(ws.color);
  };

  return (
    <>
      <div
        className="h-12 flex items-center justify-between px-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>

        <div className="flex items-center gap-3">
          {/* Workspace selector */}
          <div className="flex items-center gap-1">
            <select
              value={selectedWorkspace}
              onChange={(e) => setWorkspace(e.target.value)}
              className="text-xs px-2 py-1 rounded-md outline-none cursor-pointer appearance-none pr-6"
              style={{
                backgroundColor: "var(--input-bg)",
                color: "var(--text-secondary)",
                borderColor: "var(--border-color)",
                borderWidth: "1px",
              }}
            >
              <option value="">All workspaces</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.name}>{ws.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowManager(!showManager)}
              className="p-1 rounded-md hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
              title="Manage workspaces"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Search trigger */}
          <button
            onClick={open}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
            style={{
              backgroundColor: "var(--input-bg)",
              color: "var(--text-secondary)",
              borderColor: "var(--border-color)",
              borderWidth: "1px",
            }}
          >
            <Search size={14} />
            <span>Search</span>
            <kbd
              className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
            >
              Ctrl+K
            </kbd>
          </button>
        </div>
      </div>

      {/* Workspace manager dropdown */}
      {showManager && (
        <div
          className="absolute right-4 top-12 z-50 w-80 rounded-xl shadow-2xl p-4"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
            borderWidth: "1px",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              Manage Workspaces
            </span>
            <button
              onClick={() => setShowManager(false)}
              className="p-1 rounded hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Create new workspace */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-6 h-6 rounded-md shrink-0 cursor-pointer"
              style={{ backgroundColor: newColor }}
              onClick={() => {
                const idx = WORKSPACE_COLORS.indexOf(newColor);
                setNewColor(WORKSPACE_COLORS[(idx + 1) % WORKSPACE_COLORS.length]);
              }}
              title="Click to change color"
            />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="New workspace name..."
              className="flex-1 px-2 py-1.5 rounded-md text-xs outline-none"
              style={{
                backgroundColor: "var(--input-bg)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
                borderWidth: "1px",
              }}
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="p-1.5 rounded-md hover:opacity-80 disabled:opacity-30"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Workspace list */}
          <div className="space-y-1 max-h-48 overflow-auto">
            {workspaces.length === 0 && (
              <p className="text-xs py-2 text-center" style={{ color: "var(--text-secondary)" }}>
                No workspaces yet
              </p>
            )}
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md group"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                {editingId === ws.id ? (
                  <>
                    <div
                      className="w-5 h-5 rounded shrink-0 cursor-pointer"
                      style={{ backgroundColor: editColor }}
                      onClick={() => {
                        const idx = WORKSPACE_COLORS.indexOf(editColor);
                        setEditColor(WORKSPACE_COLORS[(idx + 1) % WORKSPACE_COLORS.length]);
                      }}
                    />
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(ws.id)}
                      className="flex-1 px-1.5 py-0.5 rounded text-xs outline-none"
                      style={{
                        backgroundColor: "var(--input-bg)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-color)",
                        borderWidth: "1px",
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(ws.id)}
                      className="p-0.5 rounded hover:opacity-80"
                      style={{ color: "var(--accent)" }}
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-0.5 rounded hover:opacity-80"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      className="w-5 h-5 rounded shrink-0"
                      style={{ backgroundColor: ws.color }}
                    />
                    <span
                      className="flex-1 text-xs truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {ws.name}
                    </span>
                    <button
                      onClick={() => startEdit(ws)}
                      className="p-0.5 rounded hover:opacity-80 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(ws.id)}
                      className="p-0.5 rounded hover:opacity-80 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--danger, #ef4444)" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
