use super::MongoStore;
use crate::storage::{store::CrossChainTxStore, BridgeChain, CrossChainTx, CrossChainTxKind};
use anyhow::Result;
use async_trait::async_trait;
use futures::TryStreamExt;
use mongodb::bson::doc;

#[async_trait]
impl CrossChainTxStore for MongoStore {
    ///
    async fn insert_tx(&self, tx: CrossChainTx) -> Result<()> {
        self.xchain_txs.insert_one(tx, None).await?;
        Ok(())
    }

    ///
    async fn set_tx_as_sent(&self, req_hash: String, tx_hash: String) -> Result<()> {
        self.xchain_txs
            .update_one(
                doc! { "req_hash": req_hash },
                doc! { "$set": { "tx_hash": tx_hash }},
                None,
            )
            .await?;

        Ok(())
    }

    ///
    async fn pending_xtxs(&self, chain: BridgeChain) -> Result<Vec<CrossChainTx>> {
        let filter = doc! { "chain": chain.to_string(), "tx_hash": "" };

        let mut cursor = self.xchain_txs.find(filter, None).await?;

        let mut txs: Vec<CrossChainTx> = vec![];

        while let Some(tx) = cursor.try_next().await? {
            txs.push(tx);
        }

        Ok(txs)
    }

    ///
    async fn list_xtxs(&self, chain: BridgeChain) -> Result<Vec<CrossChainTx>> {
        let filter = doc! { "chain": chain.to_string() };

        let mut cursor = self.xchain_txs.find(filter, None).await?;

        let mut txs: Vec<CrossChainTx> = vec![];

        while let Some(tx) = cursor.try_next().await? {
            txs.push(tx);
        }

        Ok(txs)
    }

    ///
    async fn tx_from_request_kind(
        &self,
        req_hash: &str,
        kind: CrossChainTxKind,
    ) -> Result<Option<CrossChainTx>> {
        let filter = doc! { "req_hash": req_hash, "kind": kind.to_string() };

        Ok(self.xchain_txs.find_one(filter, None).await?)
    }
}
