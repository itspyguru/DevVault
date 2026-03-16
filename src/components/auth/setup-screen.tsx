import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Shield } from "lucide-react";

export function SetupScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { setup, error } = useAuthStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      setLocalError("Password must be at least 4 characters");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords do not match");
      return;
    }
    setLocalError("");
    await setup(password);
  };

  const displayError = localError || error;

  return (
    <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl shadow-2xl" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(122, 162, 247, 0.1)' }}>
            <Shield size={32} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome to DevVault</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Create your master password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create master password"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm master password"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
          />
          {displayError && (
            <p className="text-xs" style={{ color: 'var(--danger)' }}>{displayError}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            Create Vault
          </button>
        </form>
      </div>
    </div>
  );
}
