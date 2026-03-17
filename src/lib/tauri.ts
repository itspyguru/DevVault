import { invoke } from "@tauri-apps/api/core";

function waitForTauri(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).__TAURI_INTERNALS__) {
      resolve();
      return;
    }
    // Poll until Tauri IPC is ready
    const interval = setInterval(() => {
      if ((window as any).__TAURI_INTERNALS__) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
    // Timeout after 5s - might be running outside Tauri
    setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, 5000);
  });
}

let tauriReady: Promise<void> | null = null;

function ensureTauri(): Promise<void> {
  if (!tauriReady) {
    tauriReady = waitForTauri();
  }
  return tauriReady;
}

async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  await ensureTauri();
  return invoke<T>(cmd, args);
}

// Auth commands
export async function checkHasPassword(): Promise<boolean> {
  return safeInvoke("check_has_password");
}

export async function setupPassword(password: string): Promise<void> {
  return safeInvoke("setup_password", { password });
}

export async function unlockVault(password: string): Promise<boolean> {
  return safeInvoke("unlock", { password });
}

export async function lockVault(): Promise<void> {
  return safeInvoke("lock");
}

export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  return safeInvoke("change_password", { oldPassword, newPassword });
}

export async function isUnlocked(): Promise<boolean> {
  return safeInvoke("is_unlocked");
}

// Secret types
export interface Secret {
  id: string;
  title: string;
  company: string;
  environment: string;
  username: string;
  secret: string;
  notes: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateSecret {
  title: string;
  company?: string;
  environment?: string;
  username?: string;
  secret: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateSecret {
  title?: string;
  company?: string;
  environment?: string;
  username?: string;
  secret?: string;
  notes?: string;
  tags?: string[];
}

// Secret commands
export async function createSecret(data: CreateSecret): Promise<Secret> {
  return safeInvoke("cmd_create_secret", { data });
}

export async function getSecrets(): Promise<Secret[]> {
  return safeInvoke("cmd_get_secrets");
}

export async function getSecret(id: string): Promise<Secret> {
  return safeInvoke("cmd_get_secret", { id });
}

export async function updateSecret(
  id: string,
  data: UpdateSecret
): Promise<Secret> {
  return safeInvoke("cmd_update_secret", { id, data });
}

export async function deleteSecret(id: string): Promise<void> {
  return safeInvoke("cmd_delete_secret", { id });
}

// Command types
export interface Command {
  id: string;
  title: string;
  command: string;
  description: string;
  tags: string[];
  company: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommand {
  title: string;
  command: string;
  description?: string;
  tags?: string[];
  company?: string;
}

export interface UpdateCommand {
  title?: string;
  command?: string;
  description?: string;
  tags?: string[];
  company?: string;
}

export async function createCommand(data: CreateCommand): Promise<Command> {
  return safeInvoke("cmd_create_command", { data });
}

export async function getCommands(): Promise<Command[]> {
  return safeInvoke("cmd_get_commands");
}

export async function getCommand(id: string): Promise<Command> {
  return safeInvoke("cmd_get_command", { id });
}

export async function updateCommand(
  id: string,
  data: UpdateCommand
): Promise<Command> {
  return safeInvoke("cmd_update_command", { id, data });
}

export async function deleteCommand(id: string): Promise<void> {
  return safeInvoke("cmd_delete_command", { id });
}

// Note types
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  company: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNote {
  title: string;
  content: string;
  tags?: string[];
  company?: string;
}

export interface UpdateNote {
  title?: string;
  content?: string;
  tags?: string[];
  company?: string;
}

export async function createNote(data: CreateNote): Promise<Note> {
  return safeInvoke("cmd_create_note", { data });
}

export async function getNotes(): Promise<Note[]> {
  return safeInvoke("cmd_get_notes");
}

export async function getNote(id: string): Promise<Note> {
  return safeInvoke("cmd_get_note", { id });
}

export async function updateNote(
  id: string,
  data: UpdateNote
): Promise<Note> {
  return safeInvoke("cmd_update_note", { id, data });
}

export async function deleteNote(id: string): Promise<void> {
  return safeInvoke("cmd_delete_note", { id });
}

// Link types
export interface Link {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  company: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLink {
  title: string;
  url: string;
  category?: string;
  tags?: string[];
  company?: string;
}

export interface UpdateLink {
  title?: string;
  url?: string;
  category?: string;
  tags?: string[];
  company?: string;
}

export async function createLink(data: CreateLink): Promise<Link> {
  return safeInvoke("cmd_create_link", { data });
}

export async function getLinks(): Promise<Link[]> {
  return safeInvoke("cmd_get_links");
}

export async function getLink(id: string): Promise<Link> {
  return safeInvoke("cmd_get_link", { id });
}

export async function updateLink(
  id: string,
  data: UpdateLink
): Promise<Link> {
  return safeInvoke("cmd_update_link", { id, data });
}

export async function deleteLink(id: string): Promise<void> {
  return safeInvoke("cmd_delete_link", { id });
}

// Workspace types
export interface Workspace {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CreateWorkspace {
  name: string;
  color?: string;
}

export interface UpdateWorkspace {
  name?: string;
  color?: string;
}

export async function createWorkspace(data: CreateWorkspace): Promise<Workspace> {
  return safeInvoke("cmd_create_workspace", { data });
}

export async function getWorkspaces(): Promise<Workspace[]> {
  return safeInvoke("cmd_get_workspaces");
}

export async function updateWorkspace(id: string, data: UpdateWorkspace): Promise<Workspace> {
  return safeInvoke("cmd_update_workspace", { id, data });
}

export async function deleteWorkspace(id: string): Promise<void> {
  return safeInvoke("cmd_delete_workspace", { id });
}

// Search
export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  entity_type: "secret" | "command" | "note" | "link";
  company: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  return safeInvoke("cmd_global_search", { query });
}

// Tags & Companies
export async function getAllTags(): Promise<string[]> {
  return safeInvoke("cmd_get_all_tags");
}

export async function getCompanies(): Promise<string[]> {
  return safeInvoke("cmd_get_companies");
}

// Backup
export async function exportVault(): Promise<string> {
  return safeInvoke("cmd_export_vault");
}

export async function importVault(data: string): Promise<void> {
  return safeInvoke("cmd_import_vault", { data });
}
