use anyhow::Result;
use async_trait::async_trait;
use futures::TryStreamExt;
use mongodb::bson::doc;

use super::MongoStore;
use crate::storage::{store::RequestStore, Request};

#[async_trait]
impl RequestStore for MongoStore {
    ///
    async fn reqs_by_wallet(&self, address: &str) -> Result<Vec<Request>> {
        let filter = doc! {
            "$or": [
                {"to": address},
            ]
        };

        let mut cursor = self.requests.find(filter, None).await?;

        let mut reqs: Vec<Request> = vec![];

        while let Some(r) = cursor.try_next().await? {
            reqs.push(r);
        }

        Ok(reqs)
    }

    ///
    async fn req_by_hash(&self, hash: &str) -> Result<Option<Request>> {
        Ok(self.requests.find_one(doc! { "hash": hash }, None).await?)
    }

    ///
    async fn insert_req(&self, req: Request) -> Result<()> {
        self.requests.insert_one(req, None).await?;

        Ok(())
    }
}
