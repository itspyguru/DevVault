import { useEffect, useCallback } from "react";
import { Command } from "cmdk";
import { Shield, Terminal, FileText, Link2, Search } from "lucide-react";
import { useSearchStore } from "@/stores/search-store";
import { useDebounce } from "@/hooks/use-debounce";
import { useCopy } from "@/hooks/use-copy";
import type { SearchResult } from "@/lib/tauri";

const typeIcons: Record<string, React.ElementType> = {
  secret: Shield,
  command: Terminal,
  note: FileText,
  link: Link2,
};

const typeLabels: Record<string, string> = {
  secret: "Secrets",
  command: "Commands",
  note: "Notes",
  link: "Links",
};

export function SearchOverlay() {
  const { query, setQuery, results, search, close, isSearching } =
    useSearchStore();
  const debouncedQuery = useDebounce(query, 200);
  const { copy } = useCopy();

  useEffect(() => {
    if (debouncedQuery) search(debouncedQuery);
  }, [debouncedQuery, search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  const grouped = results.reduce(
    (acc, r) => {
      if (!acc[r.entity_type]) acc[r.entity_type] = [];
      if (acc[r.entity_type].length < 5) acc[r.entity_type].push(r);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  const handleSelect = useCallback(
    (result: SearchResult) => {
      copy(result.subtitle, result.id);
      close();
    },
    [copy, close]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <Command
        className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--border-color)",
          borderWidth: "1px",
        }}
        label="Search"
      >
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <Search size={16} style={{ color: "var(--text-secondary)" }} />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search everything..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--text-primary)" }}
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[50vh] overflow-auto p-2">
          {isSearching && (
            <Command.Loading>
              <div className="py-4 text-center text-xs" style={{ color: "var(--text-secondary)" }}>Searching...</div>
            </Command.Loading>
          )}

          <Command.Empty className="py-8 text-center text-xs" style={{ color: "var(--text-secondary)" }}>
            {query ? "No results found" : "Start typing to search..."}
          </Command.Empty>

          {Object.entries(grouped).map(([type, items]) => (
            <Command.Group
              key={type}
              heading={typeLabels[type] ?? type}
              className="mb-2"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1" style={{ color: "var(--text-secondary)" }}>
                {typeLabels[type]}
              </div>
              {items.map((item) => {
                const Icon = typeIcons[type] ?? Shield;
                return (
                  <Command.Item
                    key={item.id}
                    value={`${item.title} ${item.subtitle}`}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <Icon size={14} style={{ color: "var(--text-secondary)" }} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{item.title}</span>
                      {item.company && (
                        <span className="text-xs ml-2" style={{ color: "var(--text-secondary)" }}>
                          {item.company}
                        </span>
                      )}
                    </div>
                    <span className="text-xs truncate max-w-[150px]" style={{ color: "var(--text-secondary)" }}>
                      {item.subtitle}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
