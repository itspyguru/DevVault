use chrono::Utc;
use rusqlite::{params, Connection};
use uuid::Uuid;

use crate::models::link::{CreateLink, Link, UpdateLink};

pub fn create_link(conn: &Connection, data: CreateLink) -> Result<Link, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let category = data.category.unwrap_or_else(|| "Dev Tools".to_string());
    let company = data.company.unwrap_or_default();
    let tags = data.tags.unwrap_or_default();
    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO links (id, title, url, category, tags, company, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![id, data.title, data.url, category, tags_json, company, now, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Link {
        id,
        title: data.title,
        url: data.url,
        category,
        tags,
        company,
        created_at: now.clone(),
        updated_at: now,
    })
}

pub fn get_links(conn: &Connection) -> Result<Vec<Link>, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, url, category, tags, company, created_at, updated_at FROM links ORDER BY updated_at DESC")
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

    let mut links = Vec::new();
    for row in rows {
        let (id, title, url, category, tags_json, company, created_at, updated_at) =
            row.map_err(|e| e.to_string())?;
        let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

        links.push(Link {
            id,
            title,
            url,
            category,
            tags,
            company,
            created_at,
            updated_at,
        });
    }

    Ok(links)
}

pub fn get_link(conn: &Connection, id: &str) -> Result<Link, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, url, category, tags, company, created_at, updated_at FROM links WHERE id = ?1")
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

    let (id, title, url, category, tags_json, company, created_at, updated_at) = row;
    let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

    Ok(Link {
        id,
        title,
        url,
        category,
        tags,
        company,
        created_at,
        updated_at,
    })
}

pub fn update_link(conn: &Connection, id: &str, data: UpdateLink) -> Result<Link, String> {
    let existing = get_link(conn, id)?;
    let now = Utc::now().to_rfc3339();

    let title = data.title.unwrap_or(existing.title);
    let url = data.url.unwrap_or(existing.url);
    let category = data.category.unwrap_or(existing.category);
    let company = data.company.unwrap_or(existing.company);
    let tags = data.tags.unwrap_or(existing.tags);
    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE links SET title=?1, url=?2, category=?3, tags=?4, company=?5, updated_at=?6 WHERE id=?7",
        params![title, url, category, tags_json, company, now, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(Link {
        id: id.to_string(),
        title,
        url,
        category,
        tags,
        company,
        created_at: existing.created_at,
        updated_at: now,
    })
}

pub fn delete_link(conn: &Connection, id: &str) -> Result<(), String> {
    conn.execute("DELETE FROM links WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
