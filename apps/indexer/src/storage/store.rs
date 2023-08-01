use anyhow::Result;
use async_trait::async_trait;
use crate::{BridgeRequest, BridgeRequestStatus};

/// Store for the requests persistence.
#[async_trait]
pub trait Store {
    ///
    async fn req_by_wallet(&self, address: &str) -> Result<Vec<BridgeRequest>>;
    ///
    async fn req_by_hash(&self, hash: &str) -> Result<Option<BridgeRequest>>;
    ///
    async fn req_save(&self, req: &BridgeRequest) -> Result<()>;
    ///
    async fn req_status_set(&self, hash: &str, status: BridgeRequestStatus) -> Result<()>;
}
