use crate::db::links;
use crate::models::link::{CreateLink, Link, UpdateLink};
use crate::state::AppState;

#[tauri::command]
pub fn cmd_create_link(
    state: tauri::State<'_, AppState>,
    data: CreateLink,
) -> Result<Link, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    links::create_link(&conn, data)
}

#[tauri::command]
pub fn cmd_get_links(state: tauri::State<'_, AppState>) -> Result<Vec<Link>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    links::get_links(&conn)
}

#[tauri::command]
pub fn cmd_get_link(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<Link, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    links::get_link(&conn, &id)
}

#[tauri::command]
pub fn cmd_update_link(
    state: tauri::State<'_, AppState>,
    id: String,
    data: UpdateLink,
) -> Result<Link, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    links::update_link(&conn, &id, data)
}

#[tauri::command]
pub fn cmd_delete_link(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    links::delete_link(&conn, &id)
}
