import { Search, ChevronDown } from "lucide-react";
import { useSearchStore } from "@/stores/search-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { open } = useSearchStore();
  const { companies, selectedCompany, setCompany } = useWorkspaceStore();

  return (
    <div
      className="h-12 flex items-center justify-between px-4 shrink-0"
      style={{ borderBottom: '1px solid var(--border-color)' }}
    >
      <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>

      <div className="flex items-center gap-3">
        {/* Workspace selector */}
        <select
          value={selectedCompany}
          onChange={(e) => setCompany(e.target.value)}
          className="text-xs px-2 py-1 rounded-md outline-none cursor-pointer appearance-none pr-6"
          style={{
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-secondary)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px',
          }}
        >
          <option value="">All workspaces</option>
          {companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Search trigger */}
        <button
          onClick={open}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
          style={{
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-secondary)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px',
          }}
        >
          <Search size={14} />
          <span>Search</span>
          <kbd
            className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          >
            Ctrl+K
          </kbd>
        </button>
      </div>
    </div>
  );
}
