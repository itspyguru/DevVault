use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Link {
    pub id: String,
    pub title: String,
    pub url: String,
    pub category: String,
    pub tags: Vec<String>,
    pub company: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateLink {
    pub title: String,
    pub url: String,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
    pub company: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLink {
    pub title: Option<String>,
    pub url: Option<String>,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
    pub company: Option<String>,
}
