use anyhow::Result;
use ethers::types::BlockNumber;

use crate::config::ChainConfig;
use crate::storage::store::{BlockStore, CrossChainTxStore, EventStore, RequestStore};

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
        let mut from_u64: u64 = match BlockNumber::from_str(&self.config.from_block)
            .expect("Invalid from_block value")
        {
            BlockNumber::Earliest => 0,
            BlockNumber::Number(x) => x.try_into().expect("Not a valid u64 (from)"),
            _ => anyhow::bail!("Invalid block number (from_block)"),
        };

        let mut to_block_was_latest = false;
        let mut to_u64: u64 = match &self.config.to_block {
            Some(b) => match BlockNumber::from_str(b).expect("Invalid to_block value") {
                BlockNumber::Latest => {
                    to_block_was_latest = true;
                    self.client.get_block_number().await
                }
                BlockNumber::Number(x) => x.0[0],
                _ => anyhow::bail!("Invalid block number (to_block)"),
            },
            None => self.client.get_block_number().await,
        };

        loop {
            // Here, we use fetch_logs as Starklane for now doesn't have
            // a lot's of events to monitor.
            match self.client.fetch_logs(from_u64, to_u64).await {
                Ok(logs) => {
                    let n_logs = logs.len();
                    log::info!(
                        "\nEth fetching blocks {} - {} ({} logs)",
                        from_u64,
                        to_u64,
                        n_logs
                    );

                    for l in logs {
                        // TODO: verify if the block is not already fetched and processed.
                        // If yes, skip this log.

                        match events::get_store_data(l)? {
                            (Some(r), Some(e)) => {
                                self.store.insert_req(r).await?;
                                self.store.insert_event(e.clone()).await?;

                                // TODO: check for burn auto to send TX on ethereum.

                                if e.block_number > from_u64 {
                                    from_u64 = e.block_number;
                                }
                            }
                            _ => log::warn!("Event emitted by Starklane possibly is not handled"),
                        };
                    }

                    if n_logs > 0 {
                        // To ensure those blocks are not fetched anymore,
                        // as the get_logs range includes the from_block value.
                        from_u64 += 1;

                        // We want to continue polling the head of the chain if the
                        // to_block is set to "latest" in the config.
                        if to_block_was_latest {
                            to_u64 = self.client.get_block_number().await;
                            if from_u64 > to_u64 {
                                // More consistent to always have from and to equal,
                                // or to > from.
                                to_u64 = from_u64;
                            }
                        } else {
                            // We stop at the block number in the configuration.
                            if from_u64 > to_u64 {
                                return Ok(());
                            }
                        }
                    }
                }
                Err(e) => log::error!("Error at getting eth logs {:?}", e),
            };

            time::sleep(Duration::from_secs(self.config.fetch_interval)).await;
        }
    }
}
