use anyhow::Result;
use starknet::core::types::{BlockId, BlockTag, FieldElement, EmittedEvent};

use super::client::StarknetClient;
use super::events;

use crate::utils;
use crate::config::ChainConfig;
use crate::storage::{
    BridgeChain, BlockIndex,
    store::{EventStore, RequestStore, BlockStore}
};

use std::sync::Arc;
use tokio::time::{self, Duration};

///
pub struct StarknetIndexer<T: RequestStore + EventStore + BlockStore> {
    client: StarknetClient,
    config: ChainConfig,
    store: Arc<T>,
}

impl<T> StarknetIndexer<T>
where
    T: RequestStore + EventStore + BlockStore {
    ///
    pub async fn new(config: ChainConfig, store: Arc<T>) -> Result<StarknetIndexer<T>> {
        let client = StarknetClient::new(config.clone()).await?;
        Ok(StarknetIndexer { client, config, store })
    }

    ///
    pub async fn start(&self) -> Result<()> {

        let from_block = self.client.parse_block_id(&self.config.from_block)?;
        let to_block = if let Some(to) = &self.config.to_block {
            self.client.parse_block_id(&to)?
        } else {
            BlockId::Tag(BlockTag::Latest)
        };

        if to_block == BlockId::Tag(BlockTag::Latest) {
            self.head_of_chain_poll(from_block).await?;
        } else {
            todo!();
        }

        Ok(())
        // TODO: as ethereum, we need to limit the number of blocks to keep being functional
        // even if a lot's of events are emitted by Starklane.
        // Also, this will help with transactional approach for the database, to ensure
        // atomicity.

    }

    ///
    fn fetch_range(&self, _from_block: BlockId, _to_block: BlockId) -> Result<()> {
        // TODO: a logic for fetching only from - to range of blocks
        // and process associated events, and stop when to is reached.

        // Here we can put a logic to only fetch small ranges by small ranges, until
        // we reach to.

        // If the logic is simple, maybe head_of_chain_poll and this one can be the same
        // function.
        Ok(())
    }

    /// Fetches all the events staring at `from_block` until head of the chain.
    /// Then polls the head of the chain.
    async fn head_of_chain_poll(&self, from_block: BlockId) -> Result<()> {
        log::info!("Starknet head of chain polling every {} seconds", self.config.fetch_interval);

        let mut from_u64 = self.client.block_id_to_u64(&from_block).await?;

        loop {
            time::sleep(Duration::from_secs(self.config.fetch_interval)).await;

            let latest_u64 = self.client.block_id_to_u64(&BlockId::Tag(BlockTag::Latest)).await?;

            // Don't fetch if we already are on the head of the chain.
            if from_u64 >= latest_u64 {
                log::debug!("Nothing to fetch (from={} to={})", from_u64, latest_u64);
                continue;
            }

            let block_events = self.client.fetch_events(from_block, BlockId::Number(latest_u64)).await?;

            for (block_number, events) in block_events {
                self.process_events(block_number, events).await?;

                if block_number > from_u64 {
                    from_u64 = block_number;
                }
            }

            // +1 to exlude the last fetched block at the next fetch.
            from_u64 += 1;
        };
    }

    /// Returns the number of events processed for the given block.
    async fn process_events(&self, block_number: u64, events: Vec<EmittedEvent>, ) -> Result<()> {
        log::debug!("Processing {} events for block {}", events.len(), block_number);

        if self.store.block_by_number(BridgeChain::Starknet, block_number).await?.is_some() {
            log::debug!("Block {} already indexed for starknet", block_number);
            return Ok(());
        }

        // TODO: start a database transaction/session.

        for e in events {
            match events::get_store_data(e)? {
                (Some(req), Some(ev)) => {
                    log::debug!("Request/Event\n{:?}\n{:?}", req, ev);

                    self.store.insert_req(req).await?;
                    self.store.insert_event(ev.clone()).await?;

                    // TODO: check for withdraw auto to send TX on ethereum.
                    //       check for burn auto to send TX on ethereum.
                    // Instead of sending here the TX -> put this into a database.
                    // And in the mainloop, a job will take care of checking those.
                }
                // Maybe fine (upgrade for instance, etc..)
                _ => log::warn!("Event emitted by Starklane is not handled"),
            };
        }

        let block_idx = BlockIndex {
            chain: BridgeChain::Starknet,
            block_number: block_number,
            insert_timestamp: utils::utc_now_seconds(),
        };

        self.store.insert_block(block_idx).await?;
        // TODO: end the database transaction/session.

        Ok(())
    }
}
