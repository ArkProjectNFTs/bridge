use anyhow::Result;
use ethers::types::{BlockNumber, Log, U256};

use crate::config::ChainConfig;
use crate::storage::{
    store::{BlockStore, CrossChainTxStore, EventStore, RequestStore},
    BlockIndex, BridgeChain, CrossChainTxKind,
};
use crate::utils;

use super::client::EthereumClient;
use super::events;

use std::str::FromStr;
use std::sync::Arc;
use tokio::time::{self, Duration};

///
pub struct EthereumIndexer<T: RequestStore + EventStore + BlockStore + CrossChainTxStore> {
    client: EthereumClient,
    config: ChainConfig,
    store: Arc<T>,
}

impl<T> EthereumIndexer<T>
where
    T: RequestStore + EventStore + BlockStore + CrossChainTxStore,
{
    ///
    pub async fn new(config: ChainConfig, store: Arc<T>) -> Result<EthereumIndexer<T>> {
        let client = EthereumClient::new(config.clone()).await?;
        Ok(EthereumIndexer {
            client,
            config,
            store,
        })
    }

    ///
    pub async fn start(&self) -> Result<()> {
        let (mut from, _, _) = self.get_block_range_info().await?;

        loop {
            time::sleep(Duration::from_secs(self.config.fetch_interval)).await;

            let to = self.client.get_block_number().await;

            if from >= to {
                log::info!("Nothing to fetch (from={} to={})", from, to);
                continue;
            }

            let blocks_logs = match self.client.fetch_logs(from, to).await {
                Ok(bl) => bl,
                Err(e) => {
                    log::warn!("Error fetching logs: {:?}", e);
                    continue;
                }
            };

            log::debug!("blocks logs: {:?}", blocks_logs);

            for (block_number, logs) in blocks_logs {
                match self.process_logs(block_number, logs).await {
                    Ok(_) => (),
                    Err(e) => log::warn!(
                        "Error processing logs for block {:?}\n{:?}",
                        block_number,
                        e
                    ),
                };
            }

            match self.xchain_txs_send().await {
                Ok(_) => (),
                Err(e) => log::warn!("Error sending xchain_txs {:?}", e),
            };

            // The block range was fetched and processed.
            // If any block has an error, an other instance of the indexer
            // must be restarted on a the specific range.
            from = to;
        }
    }

    ///
    async fn xchain_txs_send(&self) -> Result<()> {
        let txs = self.store.pending_xtxs(BridgeChain::Ethereum).await?;
        log::debug!("Verifying xchain_txs for ethereum node [{}]", txs.len());

        let starklane = self.client.get_bridge_sender();

        // let tx = starklane.reset().send().await?.await?;
        // println!("Transaction Receipt: {}", serde_json::to_string(&tx)?);

        // TODO: for loop instead for_each, async closure?
        for tx in txs {
            // TODO: we need to first check if a corresponding withdraw event doesn't
            // already exist. This will avoid sending a tx that will revert and can be
            // eth consuming! But how to check for that...
            // This may imply an other tx on starknet to register the associated eth block number..?
            // Because we can't afford being dependent on ethereum indexing..
            // -> Solution: the indexer and the xchain_transactor must be 2 separate binaries.
            // Like this, the indexer can be started first, and when in required conditions,
            // the xchain_transactor can be started.
            // With this solution, we can keep the indexing of starknet and ethereum totally
            // independant, and xchain_txs will only be sent when needed.

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
                    // TODO: check if the event withdraw_l1 is not already registered for this tx.
                    // we may not depend on indexing order, but if it's already here, we can save
                    // a tx + eth.
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
                    self.client.get_block_number().await
                }
                BlockNumber::Number(x) => x.0[0],
                _ => anyhow::bail!("Invalid block number (to_block)"),
            },
            None => self.client.get_block_number().await,
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
                (Some(r), Some(e)) => {
                    self.store.insert_event(e.clone()).await?;

                    if self.store.req_by_hash(&r.hash).await?.is_none() {
                        self.store.insert_req(r).await?;
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
}
