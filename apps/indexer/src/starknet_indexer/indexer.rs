use anyhow::Result;
use starknet::core::types::{BlockId, BlockTag, EmittedEvent, FieldElement};

use super::client::StarknetClient;
use super::events;

use crate::config::ChainConfig;
use crate::storage::{
    store::{BlockStore, CrossChainTxStore, EventStore, RequestStore},
    BlockIndex, BridgeChain,
};
use crate::utils;

use std::sync::Arc;
use tokio::time::{self, Duration};

///
pub struct StarknetIndexer<T: RequestStore + EventStore + BlockStore + CrossChainTxStore> {
    client: StarknetClient,
    config: ChainConfig,
    store: Arc<T>,
}

impl<T> StarknetIndexer<T>
where
    T: RequestStore + EventStore + BlockStore + CrossChainTxStore,
{
    ///
    pub async fn new(config: ChainConfig, store: Arc<T>) -> Result<StarknetIndexer<T>> {
        let client = StarknetClient::new(config.clone()).await?;
        Ok(StarknetIndexer {
            client,
            config,
            store,
        })
    }

    ///
    pub async fn start(&self) -> Result<()> {
        // TODO: start a loop that will check for the TXs (with request) to be sent to
        // starknet...! (as we have here a client for starknet txs with invoke available).
        // On starknet, it should only by auto-burn invokes.

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
        log::info!(
            "Starknet head of chain polling every {} seconds",
            self.config.fetch_interval
        );

        let mut from_u64 = self.client.block_id_to_u64(&from_block).await?;

        loop {
            time::sleep(Duration::from_secs(self.config.fetch_interval)).await;

            let latest_u64 = self
                .client
                .block_id_to_u64(&BlockId::Tag(BlockTag::Latest))
                .await?;

            // Don't fetch if we already are on the head of the chain.
            if from_u64 > latest_u64 {
                log::debug!("Nothing to fetch (from={} to={})", from_u64, latest_u64);
                continue;
            }

            let block_events = self
                .client
                .fetch_events(from_block, BlockId::Number(latest_u64))
                .await?;

            for (block_number, events) in block_events {
                self.process_events(block_number, events).await?;

                if block_number > from_u64 {
                    from_u64 = block_number;
                }
            }

            // +1 to exlude the last fetched block at the next fetch.
            from_u64 += 1;
        }
    }

    /// Processes the events for the given block.
    async fn process_events(&self, block_number: u64, events: Vec<EmittedEvent>) -> Result<()> {
        if self
            .store
            .block_by_number(BridgeChain::Starknet, block_number)
            .await?
            .is_some()
        {
            log::debug!("Block {} already indexed for starknet", block_number);
            return Ok(());
        }

        log::debug!(
            "Processing {} events for block {}",
            events.len(),
            block_number
        );

        // TODO: start a database transaction/session.

        for e in events {
            //log::debug!("raw event\n{:?}\n", e);
            let event_selector = e.keys[0].clone();
            // The header is the first felt in the data of the event.
            let request_header: FieldElement = e.data[0];

            match events::get_store_data(e) {
                Ok(store_data) => match store_data {
                    (Some(req), Some(ev), xchain_txs) => {
                        log::debug!("Request/Event\n{:?}\n{:?}", req, ev);

                        self.store.insert_event(ev.clone()).await?;

                        if self.store.req_by_hash(&req.hash).await?.is_none() {
                            self.store.insert_req(req).await?;
                        }

                        for tx in xchain_txs {
                            self.store.insert_tx(tx).await?;
                        }
                    }
                    // Maybe fine (upgrade for instance, etc..)
                    _ => log::warn!(
                        "Request or event for store could'nt be built for event: {:?}",
                        event_selector
                    ),
                },
                Err(er) => log::warn!("Event not processed {:?} -> {:?}", event_selector, er),
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
