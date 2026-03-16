use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Command {
    pub id: String,
    pub title: String,
    pub command: String,
    pub description: String,
    pub tags: Vec<String>,
    pub company: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCommand {
    pub title: String,
    pub command: String,
    pub description: Option<String>,
    pub tags: Option<Vec<String>>,
    pub company: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCommand {
    pub title: Option<String>,
    pub command: Option<String>,
    pub description: Option<String>,
    pub tags: Option<Vec<String>>,
    pub company: Option<String>,
}
