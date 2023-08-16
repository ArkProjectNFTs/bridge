use anyhow::Result;
use starknet::{
    core::{types::{FieldElement, BlockId, BlockTag}},
};

use super::client::StarknetClient;
use super::events;

use crate::storage::store::{RequestStore, EventStore};
use crate::config::ChainConfig;

use tokio::time::{self, Duration};
use std::sync::Arc;

///
pub struct StarknetIndexer {
    client: StarknetClient,
    config: ChainConfig,
}

impl StarknetIndexer {
    ///
    pub async fn new(config: ChainConfig) -> Result<StarknetIndexer> {
        let client = StarknetClient::new(
            &config.rpc_url,
            &config.account_address,
            &config.account_private_key
        ).await?;

        Ok(StarknetIndexer {
            client,
            config,
        })
    }

    ///
    pub async fn start<T: RequestStore + EventStore>(&self, store: Arc<T>) -> Result<()> {

        let addr = FieldElement::from_hex_be(&self.config.address)
            .expect("Starknet: can't deserialize address");

        let mut from_block = self.client.parse_block_id(&self.config.from_block)
            .expect("Starknet: can't deserialize from_block");

        let to_block = if let Some(to) = &self.config.to_block {
            self.client.parse_block_id(&to).expect("Starknet: can't deserialize to_block")
        } else {
            BlockId::Tag(BlockTag::Latest)
        };

        let to_block_is_latest = to_block == BlockId::Tag(BlockTag::Latest);

        loop {
            let maybe_sn_events = self.client.fetch_events(
                from_block,
                to_block,
                addr).await;

            if let Ok(events) = maybe_sn_events {
                let n_events = events.len();
                log::info!("\nSN fetching blocks {:?} - {:?} ({} logs)", from_block, to_block, n_events);

                let from_u64 = self.client.block_id_to_u64(&from_block).await?;

                for e in events {
                    let event_block = e.block_number;

                    // TODO: verify if the block is not already fetched and processed.
                    // If yes, skip this event.
                    match events::get_store_data(e)? {
                        (Some(r), Some(e)) => {
                            store.insert_req(r).await?;
                            store.insert_event(e.clone()).await?;

                            // TODO: check for withdraw auto to send TX on ethereum.
                            //       check for burn auto to send TX on ethereum.

                            if event_block > from_u64 {
                                from_block = BlockId::Number(event_block);
                            }
                        },
                        _ => log::warn!("Event emitted by Starklane possibly is not handled"),
                    };

                }

                if n_events > 0 {
                    let from_u64 = self.client.block_id_to_u64(&from_block).await? + 1;
                    let to_u64 = self.client.block_id_to_u64(&to_block).await?;

                    if !to_block_is_latest {
                        // We stop at the block number in the configuration.
                        if from_u64 > to_u64 {
                            return Ok(())
                        }
                    }

                    // if latest, we just keep polling.

                    from_block = BlockId::Number(from_u64);
                }
            } else {
                log::error!("Error at getting starknet events...! {:?}", maybe_sn_events);
            }

            time::sleep(Duration::from_secs(self.config.fetch_interval)).await;
        }
    }
}
