use rusqlite::Connection;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub color: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateWorkspace {
    pub name: String,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateWorkspace {
    pub name: Option<String>,
    pub color: Option<String>,
}

pub fn create_workspace(conn: &Connection, data: CreateWorkspace) -> Result<Workspace, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let color = data.color.unwrap_or_else(|| "#6366f1".to_string());

    conn.execute(
        "INSERT INTO workspaces (id, name, color, created_at) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![id, data.name, color, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Workspace {
        id,
        name: data.name,
        color,
        created_at: now,
    })
}

pub fn get_workspaces(conn: &Connection) -> Result<Vec<Workspace>, String> {
    let mut stmt = conn
        .prepare("SELECT id, name, color, created_at FROM workspaces ORDER BY name")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Workspace {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut workspaces = Vec::new();
    for row in rows {
        workspaces.push(row.map_err(|e| e.to_string())?);
    }
    Ok(workspaces)
}

pub fn update_workspace(
    conn: &Connection,
    id: &str,
    data: UpdateWorkspace,
) -> Result<Workspace, String> {
    let existing = conn
        .query_row(
            "SELECT id, name, color, created_at FROM workspaces WHERE id = ?1",
            rusqlite::params![id],
            |row| {
                Ok(Workspace {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    created_at: row.get(3)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    let new_name = data.name.unwrap_or(existing.name.clone());
    let new_color = data.color.unwrap_or(existing.color.clone());

    // Update workspace itself
    conn.execute(
        "UPDATE workspaces SET name = ?1, color = ?2 WHERE id = ?3",
        rusqlite::params![new_name, new_color, id],
    )
    .map_err(|e| e.to_string())?;

    // If name changed, update all entities referencing the old name
    if new_name != existing.name {
        let tables = ["secrets", "commands", "notes", "links"];
        for table in &tables {
            let query = format!("UPDATE {} SET company = ?1 WHERE company = ?2", table);
            conn.execute(&query, rusqlite::params![new_name, existing.name])
                .map_err(|e| e.to_string())?;
        }
    }

    Ok(Workspace {
        id: existing.id,
        name: new_name,
        color: new_color,
        created_at: existing.created_at,
    })
}

pub fn delete_workspace(conn: &Connection, id: &str) -> Result<(), String> {
    // Get the workspace name first to clear entity references
    let name: String = conn
        .query_row(
            "SELECT name FROM workspaces WHERE id = ?1",
            rusqlite::params![id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // Clear the company field on all entities that reference this workspace
    let tables = ["secrets", "commands", "notes", "links"];
    for table in &tables {
        let query = format!("UPDATE {} SET company = '' WHERE company = ?1", table);
        conn.execute(&query, rusqlite::params![name])
            .map_err(|e| e.to_string())?;
    }

    conn.execute(
        "DELETE FROM workspaces WHERE id = ?1",
        rusqlite::params![id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
