use anyhow::Result;
use async_trait::async_trait;
use mongodb::bson::doc;

use super::MongoStore;
use crate::storage::{
    protocol::ProtocolParser, store::StarknetBridgeRequestStore, Request, StarknetBridgeRequest,
};

#[async_trait]
impl StarknetBridgeRequestStore for MongoStore {
    ///
    async fn insert_request(&self, tx_hash: String, req: Request) -> Result<()> {
        let token_ids = req.get_token_ids();

        let starknet_bridge_request = StarknetBridgeRequest {
            collection_src: req.collection_src,
            from: req.from,
            to: req.to,
            is_checked: false,
            token_ids,
            tx_hash,
        };

        self.starknet_bridge_requests
            .insert_one(starknet_bridge_request, None)
            .await?;

        Ok(())
    }
}
