use chrono::Utc;
use rusqlite::{params, Connection};
use uuid::Uuid;

use crate::crypto::aes::{decrypt, encrypt};
use crate::models::secret::{CreateSecret, Secret, UpdateSecret};

pub fn create_secret(
    conn: &Connection,
    key: &[u8; 32],
    data: CreateSecret,
) -> Result<Secret, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let company = data.company.unwrap_or_default();
    let environment = data.environment.unwrap_or_else(|| "dev".to_string());
    let username_plain = data.username.unwrap_or_default();
    let notes_plain = data.notes.unwrap_or_default();
    let tags = data.tags.unwrap_or_default();

    let username_enc = encrypt(key, &username_plain)?;
    let secret_enc = encrypt(key, &data.secret)?;
    let notes_enc = encrypt(key, &notes_plain)?;
    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO secrets (id, title, company, environment, username, secret, notes, tags, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![id, data.title, company, environment, username_enc, secret_enc, notes_enc, tags_json, now, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Secret {
        id,
        title: data.title,
        company,
        environment,
        username: username_plain,
        secret: data.secret,
        notes: notes_plain,
        tags,
        created_at: now.clone(),
        updated_at: now,
    })
}

pub fn get_secrets(conn: &Connection, key: &[u8; 32]) -> Result<Vec<Secret>, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, company, environment, username, secret, notes, tags, created_at, updated_at FROM secrets ORDER BY updated_at DESC")
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
                row.get::<_, String>(8)?,
                row.get::<_, String>(9)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    let mut secrets = Vec::new();
    for row in rows {
        let (id, title, company, environment, username_enc, secret_enc, notes_enc, tags_json, created_at, updated_at) =
            row.map_err(|e| e.to_string())?;

        let username = decrypt(key, &username_enc)?;
        let secret = decrypt(key, &secret_enc)?;
        let notes = decrypt(key, &notes_enc)?;
        let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

        secrets.push(Secret {
            id,
            title,
            company,
            environment,
            username,
            secret,
            notes,
            tags,
            created_at,
            updated_at,
        });
    }

    Ok(secrets)
}

pub fn get_secret(conn: &Connection, key: &[u8; 32], id: &str) -> Result<Secret, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, company, environment, username, secret, notes, tags, created_at, updated_at FROM secrets WHERE id = ?1")
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
                row.get::<_, String>(8)?,
                row.get::<_, String>(9)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    let (id, title, company, environment, username_enc, secret_enc, notes_enc, tags_json, created_at, updated_at) = row;

    let username = decrypt(key, &username_enc)?;
    let secret = decrypt(key, &secret_enc)?;
    let notes = decrypt(key, &notes_enc)?;
    let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

    Ok(Secret {
        id,
        title,
        company,
        environment,
        username,
        secret,
        notes,
        tags,
        created_at,
        updated_at,
    })
}

pub fn update_secret(
    conn: &Connection,
    key: &[u8; 32],
    id: &str,
    data: UpdateSecret,
) -> Result<Secret, String> {
    let existing = get_secret(conn, key, id)?;
    let now = Utc::now().to_rfc3339();

    let title = data.title.unwrap_or(existing.title);
    let company = data.company.unwrap_or(existing.company);
    let environment = data.environment.unwrap_or(existing.environment);
    let username_plain = data.username.unwrap_or(existing.username);
    let secret_plain = data.secret.unwrap_or(existing.secret);
    let notes_plain = data.notes.unwrap_or(existing.notes);
    let tags = data.tags.unwrap_or(existing.tags);

    let username_enc = encrypt(key, &username_plain)?;
    let secret_enc = encrypt(key, &secret_plain)?;
    let notes_enc = encrypt(key, &notes_plain)?;
    let tags_json = serde_json::to_string(&tags).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE secrets SET title=?1, company=?2, environment=?3, username=?4, secret=?5, notes=?6, tags=?7, updated_at=?8 WHERE id=?9",
        params![title, company, environment, username_enc, secret_enc, notes_enc, tags_json, now, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(Secret {
        id: id.to_string(),
        title,
        company,
        environment,
        username: username_plain,
        secret: secret_plain,
        notes: notes_plain,
        tags,
        created_at: existing.created_at,
        updated_at: now,
    })
}

pub fn delete_secret(conn: &Connection, id: &str) -> Result<(), String> {
    conn.execute("DELETE FROM secrets WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
