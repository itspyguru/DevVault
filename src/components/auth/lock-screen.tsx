import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Shield } from "lucide-react";

export function LockScreen() {
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { unlock, error } = useAuthStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    const success = await unlock(password);
    if (!success) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div
        className={`w-full max-w-sm p-8 rounded-2xl shadow-2xl ${shake ? "animate-shake" : ""}`}
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent)', opacity: 0.1 }}>
            <Shield size={32} style={{ color: 'var(--accent)' }} />
          </div>
          {/* Overlay the icon properly */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 -mt-20" style={{ backgroundColor: 'rgba(122, 162, 247, 0.1)' }}>
            <Shield size={32} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>DevVault</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Enter your master password</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Master password"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              borderColor: error ? 'var(--danger)' : 'var(--border-color)',
              borderWidth: '1px',
            }}
          />
          {error && (
            <p className="text-xs mt-2" style={{ color: 'var(--danger)' }}>{error}</p>
          )}
          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            Unlock
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
