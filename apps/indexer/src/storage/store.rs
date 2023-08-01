use crate::{BridgeRequest, BridgeRequestStatus, StatusChange};
use anyhow::Result;
use async_trait::async_trait;

/// Store for the requests persistence.
#[async_trait]
pub trait BridgeRequestStore {
    ///
    async fn list_by_wallet(&self, address: &str) -> Result<Vec<BridgeRequest>>;

    ///
    async fn get_by_hash(&self, hash: &str) -> Result<Option<BridgeRequest>>;

    ///
    async fn insert(&self, req: BridgeRequest) -> Result<()>;

    ///
    async fn status_set(&self, hash: &str, status: BridgeRequestStatus, time: u64) -> Result<()>;

    ///
    async fn status_get(&self, hash: &str) -> Result<Vec<StatusChange>>;
}

/// Store for bridged collections persistence.
#[async_trait]
pub trait BridgedCollectionStore {
    /// Insert a collection as being bridged for the first time.
    async fn insert(
        &self,
        chain_src: &str,
        address_src: &str,
        address_dst: &str,
        time: u64,
        req_hash: &str,
    ) -> Result<()>;
}
