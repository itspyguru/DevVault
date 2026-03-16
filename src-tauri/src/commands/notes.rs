use crate::db::notes;
use crate::models::note::{CreateNote, Note, UpdateNote};
use crate::state::AppState;

#[tauri::command]
pub fn cmd_create_note(
    state: tauri::State<'_, AppState>,
    data: CreateNote,
) -> Result<Note, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    notes::create_note(&conn, data)
}

#[tauri::command]
pub fn cmd_get_notes(state: tauri::State<'_, AppState>) -> Result<Vec<Note>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    notes::get_notes(&conn)
}

#[tauri::command]
pub fn cmd_get_note(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<Note, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    notes::get_note(&conn, &id)
}

#[tauri::command]
pub fn cmd_update_note(
    state: tauri::State<'_, AppState>,
    id: String,
    data: UpdateNote,
) -> Result<Note, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    notes::update_note(&conn, &id, data)
}

#[tauri::command]
pub fn cmd_delete_note(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    notes::delete_note(&conn, &id)
}
