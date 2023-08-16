use anyhow::Result;
use async_trait::async_trait;
use mongodb::bson::doc;

use super::MongoStore;
use crate::storage::{store::BlockStore, BlockIndex, BridgeChain, Request};

#[async_trait]
impl BlockStore for MongoStore {
    ///
    async fn insert_block(&self, block: BlockIndex) -> Result<()> {
        self.blocks.insert_one(block, None).await?;
        Ok(())
    }

    ///
    async fn block_by_number(
        &self,
        chain: BridgeChain,
        block_number: u64,
    ) -> Result<Option<BlockIndex>> {
        Ok(self
            .blocks
            .find_one(
                doc! {
                    "chain": chain.to_string(),
                    "block_number": block_number as i64,
                },
                None,
            )
            .await?)
    }
}
