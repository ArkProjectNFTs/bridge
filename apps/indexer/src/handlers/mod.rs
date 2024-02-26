use std::sync::Arc;

use tokio::sync::RwLock as AsyncRwLock;

use crate::storage::mongo::MongoStore;
use crate::ChainsBlocks;

pub mod requests;

#[derive(Clone)]
pub struct AppState {
    pub store: Arc<MongoStore>,
    pub l1_address: String,
    pub l2_address: String,
    pub chains_blocks: Arc<AsyncRwLock<ChainsBlocks>>,
}
