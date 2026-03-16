use rusqlite::Connection;
use std::sync::Mutex;

pub struct AppState {
    pub db: Mutex<Connection>,
    pub derived_key: Mutex<Option<[u8; 32]>>,
}
