use std::sync::Arc;

use crate::storage::mongo::MongoStore;

pub mod requests;

#[derive(Clone)]
pub struct AppState {
    pub store: Arc<MongoStore>,
}
