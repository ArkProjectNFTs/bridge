use anyhow::Result;
use async_trait::async_trait;
use mongodb::{Database, Collection, Client, options::ClientOptions, bson::doc};
use crate::utils;
use crate::storage::store::Store;
use crate::{BridgeRequest, BridgeRequestStatus};
use futures::TryStreamExt;

pub struct MongoStore {
    // client: Client,
    // db: Database,
    collection: Collection<BridgeRequest>,
}

impl MongoStore {
    /// Initializes a new mongo store for the given database.
    pub async fn new(
        connection_string: &str,
        db_name: &str,
        collection_name: &str
    ) -> Result<MongoStore> {
        let client_options = ClientOptions::parse(connection_string).await?;
        let client = Client::with_options(client_options)?;
        let db = client.database(db_name);
        let collection = db.collection::<BridgeRequest>(collection_name);

        Ok(MongoStore {
            // client,
            // db,
            collection,
        })
    }
}

#[async_trait]
impl Store for MongoStore {
    ///
    async fn req_by_wallet(&self, address: &str) -> Result<Vec<BridgeRequest>> {
        let filter = doc! {
            "$or": [
                {"from": address},
                {"to": address},
            ]
        };

        let mut cursor = self.collection.find(filter, None).await?;
        let mut reqs = vec![];

        while let Some(r) = cursor.try_next().await? {
            reqs.push(r);
        }

        Ok(reqs)
    }

    ///
    async fn req_by_hash(&self, hash: &str) -> Result<Option<BridgeRequest>> {
        let i = self.collection.find_one(doc! { "hash": hash }, None).await?;
        Ok(i)
    }

    ///
    async fn req_save(&self, req: &BridgeRequest) -> Result<()> {
        self.collection.insert_one(req, None).await?;
        Ok(())
    }

    ///
    async fn req_status_set(&self, hash: &str, status: BridgeRequestStatus) -> Result<()> {
        let filter = doc! { "hash": hash };

        let update = doc! {
            "$push": {
                "status_updates": (utils::utc_now_seconds(), status)
            }
        };

        println!("{:?} {:?}", filter, update);

        self.collection
            .update_one(filter, update, None)
            .await?;

        Ok(())
    }
}
