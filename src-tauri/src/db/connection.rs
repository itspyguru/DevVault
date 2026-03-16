use rusqlite::Connection;
use tauri::Manager;

use super::migrations::run_migrations;

pub fn init_db(app_handle: &tauri::AppHandle) -> rusqlite::Result<Connection> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");

    std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");

    let db_path = app_dir.join("devvault.db");
    let conn = Connection::open(db_path)?;

    run_migrations(&conn)?;

    Ok(conn)
}
