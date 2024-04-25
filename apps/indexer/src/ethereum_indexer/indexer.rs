use super::client::EthereumClient;
use super::events;
use crate::config::{ChainConfig, XchainTxConfig};
use crate::price::moralis::MoralisPrice;
use crate::storage::{
    store::{BlockStore, CrossChainTxStore, EventStore, PendingWithdrawStore, RequestStore},
    BlockIndex, BridgeChain, CrossChainTxKind, Event, EventLabel, EventPrice,
};
use crate::utils;
use crate::ChainsBlocks;
use anyhow::Result;
use ethers::types::{BlockNumber, Log, U256};
use std::str::FromStr;
use std::sync::Arc;
use tokio::sync::RwLock as AsyncRwLock;
use tokio::time::{self, Duration};

///
pub struct EthereumIndexer<
    T: RequestStore + EventStore + BlockStore + CrossChainTxStore + PendingWithdrawStore,
> {
    client: EthereumClient,
    config: ChainConfig,
    store: Arc<T>,
    chains_blocks: Arc<AsyncRwLock<ChainsBlocks>>,
    xchain_txor_config: XchainTxConfig,
    pricer: MoralisPrice,
}

impl<T> EthereumIndexer<T>
where
    T: RequestStore + EventStore + BlockStore + CrossChainTxStore + PendingWithdrawStore,
{
    ///
    pub async fn new(
        config: ChainConfig,
        store: Arc<T>,
        chains_blocks: Arc<AsyncRwLock<ChainsBlocks>>,
        xchain_txor_config: XchainTxConfig,
    ) -> Result<EthereumIndexer<T>> {
        let client = EthereumClient::new(config.clone()).await?;
        /// TODO: should we add moralis api key to configuration file?
        let pricer = MoralisPrice::new(None);
        Ok(EthereumIndexer {
            client,
            config,
            store,
            chains_blocks,
            xchain_txor_config,
            pricer,
        })
    }

    ///
    pub async fn start(&self) -> Result<()> {
        let (mut from, _, _) = self.get_block_range_info().await?;

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

            let to = match self.client.get_block_number().await {
                Ok(v) => v,
                Err(e) => {
                    log::error!("Failed to retrieve block number: {:?}", e);
                    need_cool_down = true;
                    continue;
                }
            };

            if from >= to {
                log::info!("Nothing to fetch (from={} to={})", from, to);
                continue;
            }

            let blocks_logs = match self.client.fetch_logs(from, to).await {
                Ok(bl) => bl,
                Err(e) => {
                    log::error!("Error fetching logs: {:?}", e);
                    need_cool_down = true;
                    continue;
                }
            };

            // log::debug!("blocks logs: {:?}", blocks_logs);

            for (block_number, logs) in blocks_logs {
                match self.process_logs(block_number, logs).await {
                    Ok(_) => (),
                    Err(e) => {
                        log::error!(
                            "Error processing logs for block {:?}\n{:?}",
                            block_number,
                            e
                        );
                        need_cool_down = true;
                    }
                };
            }

            match self.xchain_txs_send().await {
                Ok(_) => (),
                Err(e) => log::warn!("Error sending xchain_txs {:?}", e),
            };

            //
            // Check for pending withdraw
            match self.process_pending_withdraws(to).await {
                Ok(_) => (),
                Err(e) => log::warn!("Error processing pending transactions {:?}", e),
            };

            //
            // The block range was fetched and processed.
            // If any block has an error, an other instance of the indexer
            // must be restarted on a the specific range.
            from = to;

            let mut cbs = self.chains_blocks.write().await;
            cbs.eth = from;
        }
    }

    ///
    async fn xchain_txs_send(&self) -> Result<()> {
        if !self.xchain_txor_config.enabled {
            log::debug!("xchain_txor is disabled in config, skipping");
            return Ok(());
        }

        let cbs = self.chains_blocks.read().await;
        if cbs.sn < self.xchain_txor_config.sn_min_block
            || cbs.eth < self.xchain_txor_config.eth_min_block
        {
            log::debug!(
                "xchain_txor skipped due to unmet blocks requirements {:?}",
                cbs
            );
            return Ok(());
        }

        let txs = self.store.pending_xtxs(BridgeChain::Ethereum).await?;
        log::debug!("Verifying xchain_txs for ethereum node [{}]", txs.len());

        let starklane = self.client.get_bridge_sender();

        for tx in txs {
            let felts_strs: Vec<String> = serde_json::from_str(&tx.req_content)
                .expect("Fail parsing request content for xchain_tx");

            let u256s: Vec<U256> = felts_strs
                .into_iter()
                .map(|felt_str| {
                    U256::from_str_radix(&felt_str, 16)
                        .expect("Invalid U256 format (expecting hex str)")
                })
                .collect();

            match tx.kind {
                CrossChainTxKind::WithdrawAuto => {
                    // If the withdraw event is already registered on L1, tx sending can be skipped.
                    let req_events: Vec<Event> = self.store.events_by_request(&tx.req_hash).await?;
                    if req_events
                        .iter()
                        .any(|e| e.label == EventLabel::WithdrawCompletedL1)
                    {
                        log::debug!(
                            "Request already withdrawn on L1 {:?}, skipping",
                            tx.req_hash
                        );
                        continue;
                    }

                    let receipt = starklane.withdraw_tokens(u256s).send().await?.await?;
                    if let Some(r) = receipt {
                        self.store
                            .set_tx_as_sent(tx.req_hash, format!("{:#064x}", r.transaction_hash))
                            .await?;
                    };
                }
                CrossChainTxKind::BurnAuto => todo!(),
            };
        }

        Ok(())
    }

    ///
    async fn get_block_range_info(&self) -> Result<(u64, u64, bool)> {
        let from_u64: u64 =
            match BlockNumber::from_str(&self.config.from_block).expect("Invalid from_block") {
                BlockNumber::Earliest => 0,
                BlockNumber::Number(x) => x.try_into().expect("Invalid from_block number"),
                _ => anyhow::bail!("Invalid block number (from_block)"),
            };

        let mut to_block_was_latest = false;
        let to_u64: u64 = match &self.config.to_block {
            Some(b) => match BlockNumber::from_str(b).expect("Invalid to_block") {
                BlockNumber::Latest => {
                    to_block_was_latest = true;
                    self.client.get_block_number().await?
                }
                BlockNumber::Number(x) => x.0[0],
                _ => anyhow::bail!("Invalid block number (to_block)"),
            },
            None => self.client.get_block_number().await?,
        };

        Ok((from_u64, to_u64, to_block_was_latest))
    }

    /// Processes the logs for the given block.
    async fn process_logs(&self, block_number: u64, logs: Vec<Log>) -> Result<()> {
        if self
            .store
            .block_by_number(BridgeChain::Ethereum, block_number)
            .await?
            .is_some()
        {
            log::debug!("Block {} already indexed for ethereum", block_number);
            return Ok(());
        }

        log::debug!(
            "Processing {} events for block {}",
            logs.len(),
            block_number
        );

        // TODO: start a database transaction/session.

        for l in logs {
            let l_sig = l.topics[0];

            match events::get_store_data(l)? {
                (Some(r), Some(mut e), xchain_tx) => {
                    log::debug!("Request/Event/Tx\n{:?}\n{:?}\n{:?}", r, e, xchain_tx);
                    if e.label == EventLabel::DepositInitiatedL1 {
                        match self.compute_event_price(&e).await {
                            Ok(price) => {
                                log::debug!("Price: {:?}", price);
                                e.price = Some(price);
                            }
                            Err(e) => log::warn!("Failed to compute event price: {:?}", e),
                        }
                    }
                    
                    log::info!("Insert event: {:?}", &e);
                    self.store.insert_event(e.clone()).await?;

                    if self.store.req_by_hash(&r.hash).await?.is_none() {
                        self.store.insert_req(r).await?;
                    }

                    if let Some(tx) = xchain_tx {
                        match tx.kind {
                            CrossChainTxKind::WithdrawAuto => {
                                // Force insert or update to ensure no more tx are fired.
                                match self
                                    .store
                                    .tx_from_request_kind(
                                        &tx.req_hash.clone(),
                                        CrossChainTxKind::WithdrawAuto,
                                    )
                                    .await?
                                {
                                    Some(_) => {
                                        self.store.set_tx_as_sent(tx.req_hash, tx.tx_hash).await?
                                    }
                                    None => self.store.insert_tx(tx).await?,
                                }
                            }
                            _ => (),
                        }
                    }

                    // TODO: check for burn auto to send TX on ethereum
                    //       and add them to the xchains store.
                }
                // Maybe fine, like proxy upgrade / ownership, ...
                _ => log::warn!("Event emitted by Starklane is not handled {:?}", l_sig),
            };
        }

        let block_idx = BlockIndex {
            chain: BridgeChain::Ethereum,
            block_number,
            insert_timestamp: utils::utc_now_seconds(),
        };

        self.store.insert_block(block_idx).await?;
        // TODO: end the database transaction/session.

        Ok(())
    }

    async fn process_pending_withdraws(&self, block_number: u64) -> Result<()> {
        let pendings = self.store.get_pending_withdraws().await?;
        let timestamp = self.client.get_block_timestamp(block_number).await?;
        for pending in pendings {
            let status = self
                .client
                .query_message_status(pending.message_hash)
                .await?;
            if status != 0 {
                if let Some(mut event) = self.store.event_by_tx(&pending.tx_hash).await? {
                    if event.label != EventLabel::WithdrawCompletedL1 {
                        event.block_timestamp = timestamp;
                        event.block_number = block_number;
                        event.label = EventLabel::WithdrawAvailableL1;
                        // TODO: which transaction hash we should set?
                        event.tx_hash = "0x435553544f4d5f5452414e53414354494f4e".to_owned(); // CUSTOM_TRANSACTION
                        
                        log::info!("Insert event: {:?}", &event);
                        self.store.insert_event(event).await?;
                        self.store.remove_pending_withdraw(pending).await?;
                    }
                }
            }
        }
        Ok(())
    }

    async fn compute_event_price(&self, e: &Event) -> Result<EventPrice> {
        let gas = self.client.get_tx_fees(&e.tx_hash).await?;
        let eth_price = self
            .pricer
            .get_price("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", None)
            .await?;
        let mut usd_price = (gas as f64) * eth_price.parse::<f64>()?;
        usd_price = usd_price / (10_u64.pow(18) as f64);

        Ok(EventPrice {
            gas,
            usd_price: format!("{}", usd_price),
        })
    }
}
