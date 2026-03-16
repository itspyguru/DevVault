use crate::db::tags;
use crate::state::AppState;

#[tauri::command]
pub fn cmd_get_all_tags(state: tauri::State<'_, AppState>) -> Result<Vec<String>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    tags::get_all_tags(&conn)
}

#[tauri::command]
pub fn cmd_get_companies(state: tauri::State<'_, AppState>) -> Result<Vec<String>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    tags::get_companies(&conn)
}
