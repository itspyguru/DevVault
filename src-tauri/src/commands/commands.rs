use crate::db::commands;
use crate::models::command::{Command, CreateCommand, UpdateCommand};
use crate::state::AppState;

#[tauri::command]
pub fn cmd_create_command(
    state: tauri::State<'_, AppState>,
    data: CreateCommand,
) -> Result<Command, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    commands::create_command(&conn, data)
}

#[tauri::command]
pub fn cmd_get_commands(state: tauri::State<'_, AppState>) -> Result<Vec<Command>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    commands::get_commands(&conn)
}

#[tauri::command]
pub fn cmd_get_command(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<Command, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    commands::get_command(&conn, &id)
}

#[tauri::command]
pub fn cmd_update_command(
    state: tauri::State<'_, AppState>,
    id: String,
    data: UpdateCommand,
) -> Result<Command, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    commands::update_command(&conn, &id, data)
}

#[tauri::command]
pub fn cmd_delete_command(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    commands::delete_command(&conn, &id)
}
