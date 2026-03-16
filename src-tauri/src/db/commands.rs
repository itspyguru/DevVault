use chrono::Utc;
use rusqlite::{params, Connection};
use uuid::Uuid;

use crate::models::command::{Command, CreateCommand, UpdateCommand};

pub fn create_command(conn: &Connection, data: CreateCommand) -> Result<Command, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let description = data.description.unwrap_or_default();
    let company = data.company.unwrap_or_default();
    let tags = data.tags.unwrap_or_default();
    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO commands (id, title, command, description, tags, company, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![id, data.title, data.command, description, tags_json, company, now, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Command {
        id,
        title: data.title,
        command: data.command,
        description,
        tags,
        company,
        created_at: now.clone(),
        updated_at: now,
    })
}

pub fn get_commands(conn: &Connection) -> Result<Vec<Command>, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, command, description, tags, company, created_at, updated_at FROM commands ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, String>(6)?,
                row.get::<_, String>(7)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    let mut commands = Vec::new();
    for row in rows {
        let (id, title, command, description, tags_json, company, created_at, updated_at) =
            row.map_err(|e| e.to_string())?;
        let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

        commands.push(Command {
            id,
            title,
            command,
            description,
            tags,
            company,
            created_at,
            updated_at,
        });
    }

    Ok(commands)
}

pub fn get_command(conn: &Connection, id: &str) -> Result<Command, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, command, description, tags, company, created_at, updated_at FROM commands WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    let row = stmt
        .query_row(params![id], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, String>(6)?,
                row.get::<_, String>(7)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    let (id, title, command, description, tags_json, company, created_at, updated_at) = row;
    let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

    Ok(Command {
        id,
        title,
        command,
        description,
        tags,
        company,
        created_at,
        updated_at,
    })
}

pub fn update_command(
    conn: &Connection,
    id: &str,
    data: UpdateCommand,
) -> Result<Command, String> {
    let existing = get_command(conn, id)?;
    let now = Utc::now().to_rfc3339();

    let title = data.title.unwrap_or(existing.title);
    let command = data.command.unwrap_or(existing.command);
    let description = data.description.unwrap_or(existing.description);
    let company = data.company.unwrap_or(existing.company);
    let tags = data.tags.unwrap_or(existing.tags);
    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE commands SET title=?1, command=?2, description=?3, tags=?4, company=?5, updated_at=?6 WHERE id=?7",
        params![title, command, description, tags_json, company, now, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(Command {
        id: id.to_string(),
        title,
        command,
        description,
        tags,
        company,
        created_at: existing.created_at,
        updated_at: now,
    })
}

pub fn delete_command(conn: &Connection, id: &str) -> Result<(), String> {
    conn.execute("DELETE FROM commands WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
