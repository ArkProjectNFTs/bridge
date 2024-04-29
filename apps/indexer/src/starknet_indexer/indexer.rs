use super::client::StarknetClient;
use super::events;
use crate::config::ChainConfig;
use crate::storage::protocol::ProtocolParser;
use crate::storage::{
    store::{
        BlockStore, CrossChainTxStore, EventStore, PendingWithdrawStore, RequestStore,
        StarknetBridgeRequestStore,
    },
    BlockIndex, BridgeChain, CrossChainTxKind, EventLabel, PendingWithdraw,
};
use crate::utils;
use crate::ChainsBlocks;
use anyhow::Result;
use starknet::core::types::{BlockId, BlockTag, EmittedEvent};
use starknet::macros::selector;
use std::sync::Arc;
use tokio::sync::RwLock as AsyncRwLock;
use tokio::time::{self, Duration};

///
pub struct StarknetIndexer<
    T: RequestStore + EventStore + BlockStore + CrossChainTxStore + PendingWithdrawStore,
> {
    client: StarknetClient,
    config: ChainConfig,
    store: Arc<T>,
    chains_blocks: Arc<AsyncRwLock<ChainsBlocks>>,
    eth_bridge_address: String,
}

impl<T> StarknetIndexer<T>
where
    T: RequestStore
        + EventStore
        + BlockStore
        + CrossChainTxStore
        + StarknetBridgeRequestStore
        + PendingWithdrawStore,
{
    ///
    pub async fn new(
        config: ChainConfig,
        store: Arc<T>,
        chains_blocks: Arc<AsyncRwLock<ChainsBlocks>>,
        eth_bridge_address: String,
    ) -> Result<StarknetIndexer<T>> {
        let client = StarknetClient::new(config.clone()).await?;
        Ok(StarknetIndexer {
            client,
            config,
            store,
            chains_blocks,
            eth_bridge_address,
        })
    }

    ///
    pub async fn start(&self) -> Result<()> {
        // TODO: start a loop that will check for the TXs (with request) to be sent to
        // starknet...! (as we have here a client for starknet txs with invoke available).
        // On starknet, it should only by auto-burn invokes.

        let from_block = self.client.parse_block_id(&self.config.from_block)?;
        let to_block = if let Some(to) = &self.config.to_block {
            self.client.parse_block_id(to)?
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
    //fn fetch_range(&self, _from_block: BlockId, _to_block: BlockId) -> Result<()> {
    // TODO: a logic for fetching only from - to range of blocks
    // and process associated events, and stop when to is reached.

    // Here we can put a logic to only fetch small ranges by small ranges, until
    // we reach to.

    // If the logic is simple, maybe head_of_chain_poll and this one can be the same
    // function.
    //Ok(())
    //}

    /// Fetches all the events staring at `from_block` until head of the chain.
    /// Then polls the head of the chain.
    async fn head_of_chain_poll(&self, from_block: BlockId) -> Result<()> {
        log::info!(
            "Starknet head of chain polling every {} seconds",
            self.config.fetch_interval
        );

        let mut from_u64 = self.client.block_id_to_u64(&from_block).await?;
        let mut need_cool_down = false;

        loop {
            let fetch_interval = if need_cool_down {
                log::warn!("Cooling down");
                self.config.fetch_interval + self.config.cooling_down
            } else {
                self.config.fetch_interval
            };
            need_cool_down = false;

            time::sleep(Duration::from_secs(fetch_interval)).await;

            let latest_u64 = match self
                .client
                .block_id_to_u64(&BlockId::Tag(BlockTag::Latest))
                .await
            {
                Ok(v) => v,
                Err(e) => {
                    log::error!("Failed to retrieve blockid: {:#}", e);
                    need_cool_down = true;
                    continue;
                }
            };

            // Don't fetch if we already are on the head of the chain.
            if from_u64 >= latest_u64 {
                log::info!("Nothing to fetch (from={} to={})", from_u64, latest_u64);
                continue;
            }

            let blocks_events = match self
                .client
                .fetch_events(BlockId::Number(from_u64), BlockId::Number(latest_u64))
                .await
            {
                Ok(r) => r,
                Err(e) => {
                    log::error!(
                        "Failed to fetch events for block ({:#}-{:#}): {:#}",
                        from_u64,
                        latest_u64,
                        e
                    );
                    need_cool_down = true;
                    continue;
                }
            };

            // log::debug!("blocks events: {:?}", blocks_events);

            for (block_number, events) in blocks_events {
                match self.process_events(block_number, events).await {
                    Ok(_) => (),
                    Err(e) => {
                        log::error!(
                            "Failed to process events for block {:#}: {:#}",
                            block_number,
                            e
                        );
                        need_cool_down = true;
                        continue;
                    }
                }
            }

            // The block range was fetched and processed.
            // If any block has an error, an other instance of the indexer
            // must be restarted on a the specific range.
            from_u64 = latest_u64;

            let mut cbs = self.chains_blocks.write().await;
            cbs.sn = from_u64;
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

        let sn_bridge_address = &self.config.clone().bridge_address;
        let eth_bridge_address = &self.eth_bridge_address;

        for e in events {
            //log::debug!("raw event\n{:?}\n", e);
            let event_selector = e.keys[0];

            // TODO: some evens may be skipped like deployed collections etc..
            // For now, we will ignore the events manually.
            if event_selector == selector!("CollectionDeployedFromL1") {
                continue;
            }

            match events::get_store_data(e) {
                Ok(store_data) => match store_data {
                    (Some(req), Some(ev), xchain_tx) => {
                        log::debug!("Request/Event/Tx\n{:?}\n{:?}\n{:?}", req, ev, xchain_tx);
                        log::info!("Insert event: {:?}", &ev);
                        self.store.insert_event(ev.clone()).await?;

                        if self.store.req_by_hash(&req.hash).await?.is_none() {
                            self.store.insert_req(req.clone()).await?;
                        }

                        if ev.label == EventLabel::WithdrawCompletedL2 {
                            self.store
                                .insert_request(ev.tx_hash.clone(), req.clone())
                                .await?;
                        }

                        if ev.label == EventLabel::DepositInitiatedL2 {
                            self.store
                                .insert_pending_withdraw(PendingWithdraw {
                                    req_hash: req.clone().hash,
                                    tx_hash: ev.tx_hash,
                                    chain_src: req.clone().chain_src,
                                    timestamp: ev.block_timestamp,
                                    message_hash: req
                                        .message_to_l1_hash(sn_bridge_address, eth_bridge_address),
                                })
                                .await?;
                        }

                        if let Some(tx) = xchain_tx {
                            match tx.kind {
                                CrossChainTxKind::WithdrawAuto => {
                                    // First check if the tx is not already inserted to not overwrite
                                    // an event already indexed on ethereum.
                                    if self
                                        .store
                                        .tx_from_request_kind(
                                            &tx.req_hash.clone(),
                                            CrossChainTxKind::WithdrawAuto,
                                        )
                                        .await?
                                        .is_none()
                                    {
                                        self.store.insert_tx(tx).await?;
                                    }
                                }
                                _ => (),
                            }
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
            block_number,
            insert_timestamp: utils::utc_now_seconds(),
        };

        self.store.insert_block(block_idx).await?;
        // TODO: end the database transaction/session.

        Ok(())
    }
}
