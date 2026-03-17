use crate::db::workspaces::{self, CreateWorkspace, UpdateWorkspace, Workspace};
use crate::state::AppState;

#[tauri::command]
pub fn cmd_create_workspace(
    state: tauri::State<'_, AppState>,
    data: CreateWorkspace,
) -> Result<Workspace, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    workspaces::create_workspace(&conn, data)
}

#[tauri::command]
pub fn cmd_get_workspaces(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<Workspace>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    workspaces::get_workspaces(&conn)
}

#[tauri::command]
pub fn cmd_update_workspace(
    state: tauri::State<'_, AppState>,
    id: String,
    data: UpdateWorkspace,
) -> Result<Workspace, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    workspaces::update_workspace(&conn, &id, data)
}

#[tauri::command]
pub fn cmd_delete_workspace(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    workspaces::delete_workspace(&conn, &id)
}
