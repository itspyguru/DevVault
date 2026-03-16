use crate::db::secrets;
use crate::models::secret::{CreateSecret, Secret, UpdateSecret};
use crate::state::AppState;

fn get_key(state: &AppState) -> Result<[u8; 32], String> {
    let derived_key = state.derived_key.lock().map_err(|e| e.to_string())?;
    derived_key.ok_or_else(|| "Vault is locked".to_string())
}

#[tauri::command]
pub fn cmd_create_secret(
    state: tauri::State<'_, AppState>,
    data: CreateSecret,
) -> Result<Secret, String> {
    let key = get_key(&state)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    secrets::create_secret(&conn, &key, data)
}

#[tauri::command]
pub fn cmd_get_secrets(state: tauri::State<'_, AppState>) -> Result<Vec<Secret>, String> {
    let key = get_key(&state)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    secrets::get_secrets(&conn, &key)
}

#[tauri::command]
pub fn cmd_get_secret(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<Secret, String> {
    let key = get_key(&state)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    secrets::get_secret(&conn, &key, &id)
}

#[tauri::command]
pub fn cmd_update_secret(
    state: tauri::State<'_, AppState>,
    id: String,
    data: UpdateSecret,
) -> Result<Secret, String> {
    let key = get_key(&state)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    secrets::update_secret(&conn, &key, &id, data)
}

#[tauri::command]
pub fn cmd_delete_secret(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    secrets::delete_secret(&conn, &id)
}
