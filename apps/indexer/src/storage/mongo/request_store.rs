use anyhow::Result;
use async_trait::async_trait;
use futures::TryStreamExt;
use mongodb::{bson::doc, options::ClientOptions, Client, Collection};
use serde::{Deserialize, Serialize};

use crate::storage::store::BridgeRequestStore;
use crate::{BridgeRequest, BridgeRequestStatus, StatusChange};

///
#[derive(Debug, Clone)]
pub struct MongoRequestStore {
    collection: Collection<BridgeRequestMongo>,
}

///
impl MongoRequestStore {
    /// Initializes a new mongo store for the given database.
    pub async fn new(
        connection_string: &str,
        db_name: &str,
        collection_name: &str,
    ) -> Result<MongoRequestStore> {
        let client_options = ClientOptions::parse(connection_string).await?;
        let client = Client::with_options(client_options)?;
        let db = client.database(db_name);
        let collection = db.collection::<BridgeRequestMongo>(collection_name);

        Ok(MongoRequestStore { collection })
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct BridgeRequestMongo {
    // Request's hash, unique identifier through source and destination chains.
    pub hash: String,
    // Request's header, containing info about the request.
    pub header: String,
    // Source chain.
    pub chain_src: String,
    // Wallet originating the request on the source chain.
    pub from: String,
    // Wallet receiving the assets on the destination chain.
    pub to: String,
    // Full raw content of the request (JSON). Contains the request's hash
    // and header too. It aims at being used mostly to claim the message on L1.
    pub content: String,
    // Keep track of the status changes. The current status is the last element of the array.
    pub status_changes: Vec<StatusChange>,
}

///
impl From<BridgeRequest> for BridgeRequestMongo {
    fn from(req: BridgeRequest) -> Self {
        BridgeRequestMongo {
            hash: req.hash,
            header: req.header,
            chain_src: req.chain_src,
            from: req.from,
            to: req.to,
            content: req.content,
            status_changes: vec![],
        }
    }
}

impl From<BridgeRequestMongo> for BridgeRequest {
    fn from(req: BridgeRequestMongo) -> Self {
        BridgeRequest {
            hash: req.hash,
            header: req.header,
            chain_src: req.chain_src,
            from: req.from,
            to: req.to,
            content: req.content,
        }
    }
}

#[async_trait]
impl BridgeRequestStore for MongoRequestStore {
    ///
    async fn list_by_wallet(&self, address: &str) -> Result<Vec<BridgeRequest>> {
        let filter = doc! {
            "$or": [
                {"from": address},
                {"to": address},
            ]
        };

        let mut cursor = self.collection.find(filter, None).await?;
        let mut reqs: Vec<BridgeRequest> = vec![];

        while let Some(r) = cursor.try_next().await? {
            reqs.push(r.into());
        }

        Ok(reqs)
    }

    ///
    async fn get_by_hash(&self, hash: &str) -> Result<Option<BridgeRequest>> {
        match self
            .collection
            .find_one(doc! { "hash": hash }, None)
            .await?
        {
            Some(req) => Ok(Some(BridgeRequest::from(req))),
            None => Ok(None),
        }
    }

    ///
    async fn insert(&self, req: BridgeRequest) -> Result<()> {
        self.collection
            .insert_one(BridgeRequestMongo::from(req), None)
            .await?;
        Ok(())
    }

    ///
    async fn status_set(&self, hash: &str, status: BridgeRequestStatus, time: u64) -> Result<()> {
        let filter = doc! { "hash": hash };

        let update = doc! {
            "$push": {
                "status_changes": doc!{
                    "to_status": status.to_string(),
                    // TODO: check if it's the best solution here...
                    //       we can also use string.
                    "time": time as i64,
                }
            }
        };

        self.collection.update_one(filter, update, None).await?;

        Ok(())
    }

    ///
    async fn status_get(&self, hash: &str) -> Result<Vec<StatusChange>> {
        if let Some(req) = self
            .collection
            .find_one(doc! { "hash": hash }, None)
            .await?
        {
            Ok(req.status_changes)
        } else {
            Ok(vec![])
        }
    }
}
