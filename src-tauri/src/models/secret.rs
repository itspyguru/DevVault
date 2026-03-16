use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Secret {
    pub id: String,
    pub title: String,
    pub company: String,
    pub environment: String,
    pub username: String,
    pub secret: String,
    pub notes: String,
    pub tags: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateSecret {
    pub title: String,
    pub company: Option<String>,
    pub environment: Option<String>,
    pub username: Option<String>,
    pub secret: String,
    pub notes: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSecret {
    pub title: Option<String>,
    pub company: Option<String>,
    pub environment: Option<String>,
    pub username: Option<String>,
    pub secret: Option<String>,
    pub notes: Option<String>,
    pub tags: Option<Vec<String>>,
}
