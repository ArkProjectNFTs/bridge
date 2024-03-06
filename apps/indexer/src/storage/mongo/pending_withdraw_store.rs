use anyhow::Result;
use async_trait::async_trait;
use futures::TryStreamExt;

use mongodb::bson::doc;

use crate::storage::{store::PendingWithdrawStore, PendingWithdraw};

use super::MongoStore;

#[async_trait]
impl PendingWithdrawStore for MongoStore {
    async fn insert_pending_withdraw(&self, pending_withdraw: PendingWithdraw) -> Result<()> {
        self.pending_withdraws
            .insert_one(pending_withdraw, None)
            .await?;
        Ok(())
    }

    async fn get_pending_withdraws(&self) -> Result<Vec<PendingWithdraw>> {
        let mut cursor = self.pending_withdraws.find(None, None).await?;
        let mut output: Vec<PendingWithdraw> = vec![];

        while let Some(p) = cursor.try_next().await? {
            output.push(p);
        }

        Ok(output)
    }

    async fn remove_pending_withdraw(&self, pending_withdraw: PendingWithdraw) -> Result<()> {
        // tx_hash shall be unique
        self.pending_withdraws
            .delete_one(doc! { "tx_hash": pending_withdraw.tx_hash}, None)
            .await?;
        Ok(())
    }
}
