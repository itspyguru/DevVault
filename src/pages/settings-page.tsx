import { useState } from "react";
import { useThemeStore } from "@/stores/theme-store";
import { useAuthStore } from "@/stores/auth-store";
import { themes } from "@/themes";
import { exportVault, importVault } from "@/lib/tauri";
import { Check, Download, Upload, Key } from "lucide-react";

export function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { changePassword } = useAuthStore();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [exporting, setExporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPw || !newPw) return;
    try {
      await changePassword(oldPw, newPw);
      setPwMsg("Password changed successfully");
      setOldPw("");
      setNewPw("");
    } catch (err) {
      setPwMsg(String(err));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportVault();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setImportMsg("Vault exported successfully");
    } catch (err) {
      setImportMsg(String(err));
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        await importVault(text);
        setImportMsg("Vault imported successfully. Refresh to see changes.");
      } catch (err) {
        setImportMsg(String(err));
      }
    };
    input.click();
  };

  const sectionStyle = {
    backgroundColor: "var(--card-bg)",
    borderColor: "var(--border-color)",
    borderWidth: "1px",
  };
  const inputStyle = {
    backgroundColor: "var(--input-bg)",
    color: "var(--text-primary)",
    borderColor: "var(--border-color)",
    borderWidth: "1px",
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Theme Picker */}
      <div className="p-4 rounded-xl" style={sectionStyle}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Theme
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="relative p-3 rounded-lg transition-all"
              style={{
                backgroundColor: t.preview,
                borderColor: theme === t.id ? "var(--accent)" : "var(--border-color)",
                borderWidth: "2px",
              }}
            >
              <span className="text-xs font-medium text-white drop-shadow-md">
                {t.name}
              </span>
              {theme === t.id && (
                <div className="absolute top-1 right-1">
                  <Check size={12} style={{ color: "var(--accent)" }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="p-4 rounded-xl" style={sectionStyle}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          <Key size={14} className="inline mr-1.5" />
          Change Master Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input
            type="password"
            value={oldPw}
            onChange={(e) => setOldPw(e.target.value)}
            placeholder="Current password"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={inputStyle}
          />
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="New password"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={inputStyle}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-xs font-medium"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            Change Password
          </button>
          {pwMsg && (
            <p className="text-xs" style={{ color: pwMsg.includes("success") ? "var(--success)" : "var(--danger)" }}>
              {pwMsg}
            </p>
          )}
        </form>
      </div>

      {/* Import/Export */}
      <div className="p-4 rounded-xl" style={sectionStyle}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Import / Export
        </h3>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            <Download size={14} />
            {exporting ? "Exporting..." : "Export Vault"}
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
              borderColor: "var(--border-color)",
              borderWidth: "1px",
            }}
          >
            <Upload size={14} />
            Import Vault
          </button>
        </div>
        {importMsg && (
          <p className="text-xs mt-2" style={{ color: importMsg.includes("success") ? "var(--success)" : "var(--danger)" }}>
            {importMsg}
          </p>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="p-4 rounded-xl" style={sectionStyle}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Keyboard Shortcuts
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["Ctrl+K", "Open search"],
            ["Ctrl+1-4", "Navigate sections"],
            ["Ctrl+N", "New item"],
            ["Ctrl+L", "Lock vault"],
            ["Ctrl+,", "Settings"],
            ["Escape", "Close dialog"],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between px-2 py-1.5 rounded" style={{ backgroundColor: "var(--bg-secondary)" }}>
              <span style={{ color: "var(--text-secondary)" }}>{desc}</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}>
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
