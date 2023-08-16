use anyhow::Result;
use mongodb::{options::ClientOptions, Client, Collection};

use crate::storage::{BlockIndex, Event, Request, CrossChainTx};

mod block_store;
mod event_store;
mod request_store;
mod xchain_tx_store;

/// Mongo db abstraction.
///
/// NOTE:
/// For now, the document type is the same as `Request` from the crate.
/// To limit coupling, it can be good in the future
/// to have a type of mongo only (MongoRequest), and implementing
/// `From<Request> for MongoRequest` among others.
/// The same applies for events.
pub struct MongoStore {
    requests: Collection<Request>,
    events: Collection<Event>,
    blocks: Collection<BlockIndex>,
    xchain_txs: Collection<CrossChainTx>,
}

///
impl MongoStore {
    /// Initializes a new mongo store for the given database.
    ///
    /// TODO: for now the collection names are hardcoded, could be passed
    ///       as argument?
    pub async fn new(connection_string: &str, db_name: &str) -> Result<MongoStore> {
        let client_options = ClientOptions::parse(connection_string).await?;
        let client = Client::with_options(client_options)?;
        let db = client.database(db_name);

        let requests = db.collection::<Request>("requests");
        let events = db.collection::<Event>("events");
        let blocks = db.collection::<BlockIndex>("blocks");
        let xchain_txs = db.collection::<CrossChainTx>("xchain_txs");

        Ok(MongoStore {
            requests,
            events,
            blocks,
            xchain_txs,
        })
    }
}
