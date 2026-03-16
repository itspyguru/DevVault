use serde::Serialize;

#[derive(Debug, Serialize, Clone)]
pub struct SearchResult {
    pub id: String,
    pub title: String,
    pub subtitle: String,
    pub entity_type: String,
    pub company: String,
}
