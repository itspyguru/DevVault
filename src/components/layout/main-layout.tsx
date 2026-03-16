import { useState, useCallback, useEffect } from "react";
import { Sidebar, type Page } from "./sidebar";
import { Header } from "./header";
import { useAuthStore } from "@/stores/auth-store";
import { useSearchStore } from "@/stores/search-store";
import { initKeyboardListener, registerShortcut } from "@/lib/keyboard";
import { SecretsPage } from "@/pages/secrets-page";
import { CommandsPage } from "@/pages/commands-page";
import { NotesPage } from "@/pages/notes-page";
import { LinksPage } from "@/pages/links-page";
import { SettingsPage } from "@/pages/settings-page";
import { SearchOverlay } from "@/components/search/search-overlay";

const pageTitles: Record<Page, string> = {
  secrets: "Secrets",
  commands: "Commands",
  notes: "Notes",
  links: "Links",
  settings: "Settings",
};

export function MainLayout() {
  const [activePage, setActivePage] = useState<Page>("secrets");
  const { lock } = useAuthStore();
  const { toggle: toggleSearch, isOpen: searchOpen } = useSearchStore();

  useEffect(() => {
    initKeyboardListener();
    registerShortcut("Ctrl+k", () => toggleSearch());
    registerShortcut("Ctrl+1", () => setActivePage("secrets"));
    registerShortcut("Ctrl+2", () => setActivePage("commands"));
    registerShortcut("Ctrl+3", () => setActivePage("notes"));
    registerShortcut("Ctrl+4", () => setActivePage("links"));
    registerShortcut("Ctrl+,", () => setActivePage("settings"));
    registerShortcut("Ctrl+l", () => lock());
  }, []);

  const handleLock = useCallback(async () => {
    await lock();
  }, [lock]);

  const renderPage = () => {
    switch (activePage) {
      case "secrets": return <SecretsPage />;
      case "commands": return <CommandsPage />;
      case "notes": return <NotesPage />;
      case "links": return <LinksPage />;
      case "settings": return <SettingsPage />;
    }
  };

  return (
    <div className="h-full flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} onLock={handleLock} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={pageTitles[activePage]} />
        <div className="flex-1 overflow-auto p-4">
          {renderPage()}
        </div>
      </div>
      {searchOpen && <SearchOverlay />}
    </div>
  );
}
