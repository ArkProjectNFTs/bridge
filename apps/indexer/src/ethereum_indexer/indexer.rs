use anyhow::Result;
use ethers::types::{BlockNumber, Log};

use crate::config::ChainConfig;
use crate::storage::{
    store::{BlockStore, CrossChainTxStore, EventStore, RequestStore},
    BlockIndex, BridgeChain,
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
        let (mut from, mut to, continue_polling_blocks) = self.get_block_range_info().await?;

        loop {
            time::sleep(Duration::from_secs(self.config.fetch_interval)).await;

            to = self.client.get_block_number().await;

            if from >= to {
                log::debug!("Nothing to fetch (from={} to={})", from, to);
                continue;
            }

            let blocks_logs = self.client.fetch_logs(from, to).await?;

            for (block_number, logs) in blocks_logs {
                self.process_logs(block_number, logs).await?;

                if block_number > from {
                    from = block_number;
                }
            }

            // +1 to exlude the last fetched block at the next fetch.
            from += 1;

            // We want to continue polling the head of the chain if the
            // to_block is set to "latest" in the config.
            if continue_polling_blocks {
                to = self.client.get_block_number().await;
                if from > to {
                    // More consistent to always have from and to equal,
                    // or to > from.
                    from = to;
                }
            } else {
                // We stop at the block number in the configuration.
                if from > to {
                    return Ok(());
                }
            }
        }
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
            match events::get_store_data(l)? {
                (Some(r), Some(e)) => {
                    self.store.insert_req(r).await?;
                    self.store.insert_event(e.clone()).await?;

                    // TODO: check for burn auto to send TX on ethereum
                    //       and add them to the xchains store.
                }
                // Maybe fine, like proxy upgrade / ownership, ...
                _ => log::warn!("Event emitted by Starklane is not handled"),
            };
        }

        let block_idx = BlockIndex {
            chain: BridgeChain::Ethereum,
            block_number: block_number,
            insert_timestamp: utils::utc_now_seconds(),
        };

        self.store.insert_block(block_idx).await?;
        // TODO: end the database transaction/session.

        Ok(())
    }
}
