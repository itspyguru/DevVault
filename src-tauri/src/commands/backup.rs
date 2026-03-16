use serde::{Deserialize, Serialize};

use crate::state::AppState;

#[derive(Serialize, Deserialize)]
struct VaultBackup {
    secrets: Vec<RawRow>,
    commands: Vec<RawRow>,
    notes: Vec<RawRow>,
    links: Vec<RawRow>,
}

#[derive(Serialize, Deserialize)]
struct RawRow {
    #[serde(flatten)]
    fields: serde_json::Map<String, serde_json::Value>,
}

#[tauri::command]
pub fn cmd_export_vault(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let secrets = export_table(&conn, "secrets", &[
        "id", "title", "company", "environment", "username", "secret", "notes", "tags", "created_at", "updated_at",
    ])?;
    let commands = export_table(&conn, "commands", &[
        "id", "title", "command", "description", "tags", "company", "created_at", "updated_at",
    ])?;
    let notes = export_table(&conn, "notes", &[
        "id", "title", "content", "tags", "company", "created_at", "updated_at",
    ])?;
    let links = export_table(&conn, "links", &[
        "id", "title", "url", "category", "tags", "company", "created_at", "updated_at",
    ])?;

    let backup = VaultBackup {
        secrets,
        commands,
        notes,
        links,
    };

    serde_json::to_string_pretty(&backup).map_err(|e| e.to_string())
}

fn export_table(
    conn: &rusqlite::Connection,
    table: &str,
    columns: &[&str],
) -> Result<Vec<RawRow>, String> {
    let cols = columns.join(", ");
    let query = format!("SELECT {} FROM {}", cols, table);
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            let mut fields = serde_json::Map::new();
            for (i, col) in columns.iter().enumerate() {
                let val: String = row.get(i)?;
                fields.insert(col.to_string(), serde_json::Value::String(val));
            }
            Ok(RawRow { fields })
        })
        .map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| e.to_string())?);
    }
    Ok(result)
}

#[tauri::command]
pub fn cmd_import_vault(state: tauri::State<'_, AppState>, data: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let backup: VaultBackup = serde_json::from_str(&data).map_err(|e| e.to_string())?;

    // Import secrets
    for row in &backup.secrets {
        import_row(&conn, "secrets", row, &[
            "id", "title", "company", "environment", "username", "secret", "notes", "tags", "created_at", "updated_at",
        ])?;
    }

    // Import commands
    for row in &backup.commands {
        import_row(&conn, "commands", row, &[
            "id", "title", "command", "description", "tags", "company", "created_at", "updated_at",
        ])?;
    }

    // Import notes
    for row in &backup.notes {
        import_row(&conn, "notes", row, &[
            "id", "title", "content", "tags", "company", "created_at", "updated_at",
        ])?;
    }

    // Import links
    for row in &backup.links {
        import_row(&conn, "links", row, &[
            "id", "title", "url", "category", "tags", "company", "created_at", "updated_at",
        ])?;
    }

    Ok(())
}

fn import_row(
    conn: &rusqlite::Connection,
    table: &str,
    row: &RawRow,
    columns: &[&str],
) -> Result<(), String> {
    let cols = columns.join(", ");
    let placeholders: Vec<String> = (1..=columns.len()).map(|i| format!("?{}", i)).collect();
    let placeholders_str = placeholders.join(", ");

    let query = format!(
        "INSERT OR REPLACE INTO {} ({}) VALUES ({})",
        table, cols, placeholders_str
    );

    let values: Vec<String> = columns
        .iter()
        .map(|col| {
            row.fields
                .get(*col)
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string()
        })
        .collect();

    let params: Vec<&dyn rusqlite::types::ToSql> =
        values.iter().map(|v| v as &dyn rusqlite::types::ToSql).collect();

    conn.execute(&query, params.as_slice())
        .map_err(|e| e.to_string())?;

    Ok(())
}
