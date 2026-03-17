mod state;
mod db;
mod crypto;
mod models;
mod commands;

use db::connection::init_db;
use state::AppState;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            app.handle().plugin(
                tauri_plugin_log::Builder::default()
                    .level(log::LevelFilter::Info)
                    .build(),
            )?;
            log::info!("DevVault starting up...");
            let conn = match init_db(app.handle()) {
                Ok(c) => {
                    log::info!("Database initialized successfully");
                    c
                }
                Err(e) => {
                    log::error!("Failed to initialize database: {}", e);
                    return Err(Box::new(e) as Box<dyn std::error::Error>);
                }
            };
            app.manage(AppState {
                db: Mutex::new(conn),
                derived_key: Mutex::new(None),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::auth::check_has_password,
            commands::auth::setup_password,
            commands::auth::unlock,
            commands::auth::lock,
            commands::auth::change_password,
            commands::auth::is_unlocked,
            commands::secrets::cmd_create_secret,
            commands::secrets::cmd_get_secrets,
            commands::secrets::cmd_get_secret,
            commands::secrets::cmd_update_secret,
            commands::secrets::cmd_delete_secret,
            commands::commands::cmd_create_command,
            commands::commands::cmd_get_commands,
            commands::commands::cmd_get_command,
            commands::commands::cmd_update_command,
            commands::commands::cmd_delete_command,
            commands::notes::cmd_create_note,
            commands::notes::cmd_get_notes,
            commands::notes::cmd_get_note,
            commands::notes::cmd_update_note,
            commands::notes::cmd_delete_note,
            commands::links::cmd_create_link,
            commands::links::cmd_get_links,
            commands::links::cmd_get_link,
            commands::links::cmd_update_link,
            commands::links::cmd_delete_link,
            commands::search::cmd_global_search,
            commands::tags::cmd_get_all_tags,
            commands::tags::cmd_get_companies,
            commands::backup::cmd_export_vault,
            commands::backup::cmd_import_vault,
            commands::workspaces::cmd_create_workspace,
            commands::workspaces::cmd_get_workspaces,
            commands::workspaces::cmd_update_workspace,
            commands::workspaces::cmd_delete_workspace,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
