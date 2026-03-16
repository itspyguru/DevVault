use rusqlite::Connection;
use std::collections::BTreeSet;

pub fn get_all_tags(conn: &Connection) -> Result<Vec<String>, String> {
    let mut all_tags = BTreeSet::new();

    let tables = ["secrets", "commands", "notes", "links"];
    for table in &tables {
        let query = format!("SELECT tags FROM {}", table);
        let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map([], |row| row.get::<_, String>(0))
            .map_err(|e| e.to_string())?;

        for row in rows {
            let tags_json = row.map_err(|e| e.to_string())?;
            let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
            for tag in tags {
                if !tag.is_empty() {
                    all_tags.insert(tag);
                }
            }
        }
    }

    Ok(all_tags.into_iter().collect())
}

pub fn get_companies(conn: &Connection) -> Result<Vec<String>, String> {
    let mut all_companies = BTreeSet::new();

    let tables = ["secrets", "commands", "notes", "links"];
    for table in &tables {
        let query = format!("SELECT DISTINCT company FROM {}", table);
        let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map([], |row| row.get::<_, String>(0))
            .map_err(|e| e.to_string())?;

        for row in rows {
            let company = row.map_err(|e| e.to_string())?;
            if !company.is_empty() {
                all_companies.insert(company);
            }
        }
    }

    Ok(all_companies.into_iter().collect())
}
