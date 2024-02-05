//! Structs and traits related to data to be stored
//! after indexing Starklane bridge events.
use anyhow::Result;
use async_trait::async_trait;

use crate::storage::{BlockIndex, BridgeChain, CrossChainTx, Event, Request, CrossChainTxKind};

/// Store related to cross chain transactions.
#[async_trait]
pub trait CrossChainTxStore {
    ///
    async fn insert_tx(&self, tx: CrossChainTx) -> Result<()>;

    ///
    async fn set_tx_as_sent(&self, req_hash: String, tx_hash: String) -> Result<()>;

    ///
    async fn list_xtxs(&self, chain: BridgeChain) -> Result<Vec<CrossChainTx>>;

    ///
    async fn pending_xtxs(&self, chain: BridgeChain) -> Result<Vec<CrossChainTx>>;

    ///
    async fn tx_from_request_kind(&self, req_hash: &str, kind: CrossChainTxKind) -> Result<Option<CrossChainTx>>;
}

/// Store related to the indexing state.
#[async_trait]
pub trait BlockStore {
    ///
    async fn insert_block(&self, block: BlockIndex) -> Result<()>;

    ///
    async fn block_by_number(
        &self,
        chain: BridgeChain,
        block_number: u64,
    ) -> Result<Option<BlockIndex>>;
}

/// Store for the requests content.
#[async_trait]
pub trait RequestStore {
    ///
    async fn reqs_by_wallet(&self, address: &str) -> Result<Vec<Request>>;

    ///
    async fn req_by_hash(&self, hash: &str) -> Result<Option<Request>>;

    ///
    async fn insert_req(&self, req: Request) -> Result<()>;
}

/// Store for events.
#[async_trait]
pub trait EventStore {
    ///
    async fn insert_event(&self, event: Event) -> Result<()>;

    ///
    async fn events_by_request(&self, req_hash: &str) -> Result<Vec<Event>>;

    /// 
    async fn event_by_tx(&self, tx_hash: &str) -> Result<Option<Event>>;
}

/// Store for bridged collections.
#[async_trait]
pub trait CollectionStore {
    /// Insert a collection as being bridged for the first time.
    async fn insert_collection(
        &self,
        chain_src: &str,
        address_src: &str,
        address_dst: &str,
        time: u64,
        req_hash: &str,
    ) -> Result<()>;
}
