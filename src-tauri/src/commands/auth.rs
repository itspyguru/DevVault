use base64::{engine::general_purpose::STANDARD, Engine as _};
use rusqlite::params;

use crate::crypto::aes::{decrypt, encrypt};
use crate::crypto::key::{derive_key, generate_salt};
use crate::state::AppState;

#[tauri::command]
pub fn check_has_password(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT value FROM app_config WHERE key = 'password_hash'")
        .map_err(|e| e.to_string())?;

    let exists = stmt.exists([]).map_err(|e| e.to_string())?;
    Ok(exists)
}

#[tauri::command]
pub fn setup_password(state: tauri::State<'_, AppState>, password: String) -> Result<(), String> {
    let salt = generate_salt();
    let key = derive_key(&password, &salt);

    let verification = encrypt(&key, "DEVVAULT_VERIFY")?;
    let salt_b64 = STANDARD.encode(salt);

    let conn = state.db.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT OR REPLACE INTO app_config (key, value) VALUES ('salt', ?1)",
        params![salt_b64],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT OR REPLACE INTO app_config (key, value) VALUES ('password_hash', ?1)",
        params![verification],
    )
    .map_err(|e| e.to_string())?;

    let mut derived_key = state.derived_key.lock().map_err(|e| e.to_string())?;
    *derived_key = Some(key);

    Ok(())
}

#[tauri::command]
pub fn unlock(state: tauri::State<'_, AppState>, password: String) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let salt_b64: String = conn
        .query_row(
            "SELECT value FROM app_config WHERE key = 'salt'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("No salt found: {}", e))?;

    let verification: String = conn
        .query_row(
            "SELECT value FROM app_config WHERE key = 'password_hash'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("No password hash found: {}", e))?;

    let salt = STANDARD
        .decode(&salt_b64)
        .map_err(|e| format!("Salt decode failed: {}", e))?;

    let key = derive_key(&password, &salt);

    match decrypt(&key, &verification) {
        Ok(plaintext) if plaintext == "DEVVAULT_VERIFY" => {
            let mut derived_key = state.derived_key.lock().map_err(|e| e.to_string())?;
            *derived_key = Some(key);
            Ok(true)
        }
        _ => Ok(false),
    }
}

#[tauri::command]
pub fn lock(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut derived_key = state.derived_key.lock().map_err(|e| e.to_string())?;
    *derived_key = None;
    Ok(())
}

#[tauri::command]
pub fn change_password(
    state: tauri::State<'_, AppState>,
    old_password: String,
    new_password: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Verify old password
    let salt_b64: String = conn
        .query_row(
            "SELECT value FROM app_config WHERE key = 'salt'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("No salt found: {}", e))?;

    let verification: String = conn
        .query_row(
            "SELECT value FROM app_config WHERE key = 'password_hash'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("No password hash found: {}", e))?;

    let old_salt = STANDARD
        .decode(&salt_b64)
        .map_err(|e| format!("Salt decode failed: {}", e))?;

    let old_key = derive_key(&old_password, &old_salt);

    match decrypt(&old_key, &verification) {
        Ok(plaintext) if plaintext == "DEVVAULT_VERIFY" => {}
        _ => return Err("Incorrect old password".to_string()),
    }

    // Generate new key
    let new_salt = generate_salt();
    let new_key = derive_key(&new_password, &new_salt);

    // Re-encrypt all secrets
    let mut stmt = conn
        .prepare("SELECT id, username, secret, notes FROM secrets")
        .map_err(|e| e.to_string())?;

    let rows: Vec<(String, String, String, String)> = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
            ))
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    for (id, username_enc, secret_enc, notes_enc) in rows {
        let username = decrypt(&old_key, &username_enc)?;
        let secret = decrypt(&old_key, &secret_enc)?;
        let notes = decrypt(&old_key, &notes_enc)?;

        let new_username = encrypt(&new_key, &username)?;
        let new_secret = encrypt(&new_key, &secret)?;
        let new_notes = encrypt(&new_key, &notes)?;

        conn.execute(
            "UPDATE secrets SET username=?1, secret=?2, notes=?3 WHERE id=?4",
            params![new_username, new_secret, new_notes, id],
        )
        .map_err(|e| e.to_string())?;
    }

    // Update app_config
    let new_salt_b64 = STANDARD.encode(new_salt);
    let new_verification = encrypt(&new_key, "DEVVAULT_VERIFY")?;

    conn.execute(
        "INSERT OR REPLACE INTO app_config (key, value) VALUES ('salt', ?1)",
        params![new_salt_b64],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT OR REPLACE INTO app_config (key, value) VALUES ('password_hash', ?1)",
        params![new_verification],
    )
    .map_err(|e| e.to_string())?;

    let mut derived_key = state.derived_key.lock().map_err(|e| e.to_string())?;
    *derived_key = Some(new_key);

    Ok(())
}

#[tauri::command]
pub fn is_unlocked(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    let derived_key = state.derived_key.lock().map_err(|e| e.to_string())?;
    Ok(derived_key.is_some())
}
