use anyhow::Result;
use async_trait::async_trait;
use futures::TryStreamExt;
use mongodb::bson::doc;

use super::MongoStore;
use crate::storage::{store::EventStore, Event};

#[async_trait]
impl EventStore for MongoStore {
    ///
    async fn events_by_request(&self, req_hash: &str) -> Result<Vec<Event>> {
        let filter = doc! { "req_hash": req_hash };

        let mut cursor = self.events.find(filter, None).await?;

        let mut events: Vec<Event> = vec![];

        while let Some(e) = cursor.try_next().await? {
            events.push(e);
        }

        Ok(events)
    }

    ///
    async fn event_by_tx(&self, tx_hash: &str) -> Result<Option<Event>> {
        Ok(self.events.find_one(doc! { "tx_hash": tx_hash }, None).await?)
    }

    ///
    async fn insert_event(&self, event: Event) -> Result<()> {
        self.events.insert_one(event, None).await?;

        Ok(())
    }
}
