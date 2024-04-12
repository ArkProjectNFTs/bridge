use anyhow::Result;
use async_trait::async_trait;
use futures::TryStreamExt;
use mongodb::{bson::doc, options::AggregateOptions};

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

    async fn get_total_tokens_bridged_on_starknet(
        &self,
        eth_contract_address: &str,
    ) -> Result<u64> {
        let pipeline = vec![
            doc! {
                "$match": {
                    "collection_src": eth_contract_address,
                }
            },
            doc! {
                "$unwind": "$token_ids"
            },
            doc! {
                "$group": {
                    "_id": null,
                    "total_tokens": {
                        "$sum": 1
                    }
                }
            },
        ];

        let mut cursor = self
            .starknet_bridge_requests
            .aggregate(pipeline, AggregateOptions::default())
            .await?;

        let mut total_tokens: u64 = 0;
        while let Some(doc) = cursor.try_next().await? {
            if let Ok(total) = doc.get_i32("total_tokens") {
                total_tokens += total as u64;
            };
        }

        Ok(total_tokens)
    }

    ///
    async fn event_by_tx(&self, tx_hash: &str) -> Result<Option<Event>> {
        Ok(self
            .events
            .find_one(doc! { "tx_hash": tx_hash }, None)
            .await?)
    }

    ///
    async fn insert_event(&self, event: Event) -> Result<()> {
        self.events.insert_one(event, None).await?;

        Ok(())
    }
}
