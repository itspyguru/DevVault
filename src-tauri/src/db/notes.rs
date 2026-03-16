use chrono::Utc;
use rusqlite::{params, Connection};
use uuid::Uuid;

use crate::models::note::{CreateNote, Note, UpdateNote};

pub fn create_note(conn: &Connection, data: CreateNote) -> Result<Note, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let company = data.company.unwrap_or_default();
    let tags = data.tags.unwrap_or_default();
    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO notes (id, title, content, tags, company, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![id, data.title, data.content, tags_json, company, now, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Note {
        id,
        title: data.title,
        content: data.content,
        tags,
        company,
        created_at: now.clone(),
        updated_at: now,
    })
}

pub fn get_notes(conn: &Connection) -> Result<Vec<Note>, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, content, tags, company, created_at, updated_at FROM notes ORDER BY updated_at DESC")
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
            ))
        })
        .map_err(|e| e.to_string())?;

    let mut notes = Vec::new();
    for row in rows {
        let (id, title, content, tags_json, company, created_at, updated_at) =
            row.map_err(|e| e.to_string())?;
        let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

        notes.push(Note {
            id,
            title,
            content,
            tags,
            company,
            created_at,
            updated_at,
        });
    }

    Ok(notes)
}

pub fn get_note(conn: &Connection, id: &str) -> Result<Note, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, content, tags, company, created_at, updated_at FROM notes WHERE id = ?1")
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
            ))
        })
        .map_err(|e| e.to_string())?;

    let (id, title, content, tags_json, company, created_at, updated_at) = row;
    let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

    Ok(Note {
        id,
        title,
        content,
        tags,
        company,
        created_at,
        updated_at,
    })
}

pub fn update_note(conn: &Connection, id: &str, data: UpdateNote) -> Result<Note, String> {
    let existing = get_note(conn, id)?;
    let now = Utc::now().to_rfc3339();

    let title = data.title.unwrap_or(existing.title);
    let content = data.content.unwrap_or(existing.content);
    let company = data.company.unwrap_or(existing.company);
    let tags = data.tags.unwrap_or(existing.tags);
    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE notes SET title=?1, content=?2, tags=?3, company=?4, updated_at=?5 WHERE id=?6",
        params![title, content, tags_json, company, now, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(Note {
        id: id.to_string(),
        title,
        content,
        tags,
        company,
        created_at: existing.created_at,
        updated_at: now,
    })
}

pub fn delete_note(conn: &Connection, id: &str) -> Result<(), String> {
    conn.execute("DELETE FROM notes WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
