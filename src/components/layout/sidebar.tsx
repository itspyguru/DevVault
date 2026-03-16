import { Shield, Terminal, FileText, Link2, Settings, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type Page = "secrets" | "commands" | "notes" | "links" | "settings";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLock: () => void;
}

const navItems: { id: Page; icon: React.ElementType; label: string }[] = [
  { id: "secrets", icon: Shield, label: "Secrets" },
  { id: "commands", icon: Terminal, label: "Commands" },
  { id: "notes", icon: FileText, label: "Notes" },
  { id: "links", icon: Link2, label: "Links" },
];

export function Sidebar({ activePage, onNavigate, onLock }: SidebarProps) {
  return (
    <div
      className="w-[48px] h-full flex flex-col items-center py-4 gap-2 shrink-0"
      style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)' }}
    >
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
            "hover:opacity-80"
          )}
          style={{
            backgroundColor: activePage === id ? 'var(--accent)' : 'transparent',
            color: activePage === id ? '#fff' : 'var(--text-secondary)',
          }}
          title={label}
        >
          <Icon size={18} />
        </button>
      ))}

      <div className="flex-1" />

      <button
        onClick={() => onNavigate("settings")}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
        style={{
          backgroundColor: activePage === "settings" ? 'var(--accent)' : 'transparent',
          color: activePage === "settings" ? '#fff' : 'var(--text-secondary)',
        }}
        title="Settings"
      >
        <Settings size={18} />
      </button>

      <button
        onClick={onLock}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
        style={{ color: 'var(--text-secondary)' }}
        title="Lock vault"
      >
        <Lock size={18} />
      </button>
    </div>
  );
}
