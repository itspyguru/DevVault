use rusqlite::params;

use crate::models::search::SearchResult;
use crate::state::AppState;

#[tauri::command]
pub fn cmd_global_search(
    state: tauri::State<'_, AppState>,
    query: String,
) -> Result<Vec<SearchResult>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let pattern = format!("%{}%", query);
    let mut results = Vec::new();

    // Search secrets (only title and company, not encrypted fields)
    {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, company, environment FROM secrets WHERE title LIKE ?1 OR company LIKE ?1 OR environment LIKE ?1",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(params![pattern], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                ))
            })
            .map_err(|e| e.to_string())?;

        for row in rows {
            let (id, title, company, environment) = row.map_err(|e| e.to_string())?;
            results.push(SearchResult {
                id,
                title,
                subtitle: format!("{} - {}", company, environment),
                entity_type: "secret".to_string(),
                company,
            });
        }
    }

    // Search commands
    {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, command, description, company FROM commands WHERE title LIKE ?1 OR command LIKE ?1 OR description LIKE ?1",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(params![pattern], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, String>(4)?,
                ))
            })
            .map_err(|e| e.to_string())?;

        for row in rows {
            let (id, title, command, _description, company) = row.map_err(|e| e.to_string())?;
            results.push(SearchResult {
                id,
                title,
                subtitle: command,
                entity_type: "command".to_string(),
                company,
            });
        }
    }

    // Search notes
    {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, company FROM notes WHERE title LIKE ?1 OR content LIKE ?1",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(params![pattern], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                ))
            })
            .map_err(|e| e.to_string())?;

        for row in rows {
            let (id, title, content, company) = row.map_err(|e| e.to_string())?;
            let subtitle = if content.len() > 100 {
                format!("{}...", &content[..100])
            } else {
                content
            };
            results.push(SearchResult {
                id,
                title,
                subtitle,
                entity_type: "note".to_string(),
                company,
            });
        }
    }

    // Search links
    {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, url, category, company FROM links WHERE title LIKE ?1 OR url LIKE ?1 OR category LIKE ?1",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(params![pattern], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, String>(4)?,
                ))
            })
            .map_err(|e| e.to_string())?;

        for row in rows {
            let (id, title, url, _category, company) = row.map_err(|e| e.to_string())?;
            results.push(SearchResult {
                id,
                title,
                subtitle: url,
                entity_type: "link".to_string(),
                company,
            });
        }
    }

    Ok(results)
}
