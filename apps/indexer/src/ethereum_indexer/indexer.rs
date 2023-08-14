use anyhow::Result;
use alloy_primitives::Address;

use crate::storage::store::BridgeRequestStore;
use crate::config::ChainConfig;

use super::client::EthereumClient;

use tokio::time::{self, Duration};
use std::sync::Arc;

///
pub struct EthereumIndexer {
    client: EthereumClient,
    config: ChainConfig,
}

impl EthereumIndexer {
    ///
    pub fn new(config: ChainConfig) -> Result<EthereumIndexer> {
        let client = EthereumClient::new(&config.rpc_url)?;

        Ok(EthereumIndexer {
            client,
            config,
        })
    }

    ///
    pub async fn start<T: BridgeRequestStore>(&self, store: Arc<T>) {
        let addr: Address = Address::parse_checksummed(self.config.address.clone(), None)
            .expect("Ethereum address is invalid");

        let to_block = if let Some(to) = &self.config.to_block {
            &to
        } else {
            "latest"
        };

        loop {
            let maybe_eth_logs = self.client.fetch_logs(
                &self.config.from_block,
                to_block,
                addr).await;

            if let Ok(logs) = maybe_eth_logs {
                println!("{:?}", logs);
                // identify the logs + register data in the db store.

                // TODO: we want to have a store transaction for each block.
                // This will ensure that the block is or fully processed,
                // or not processed at all.
                // The store for indexing state will register if the block is processed.
                // And block is skipped if already processed.
                //
                // To identify block, the log entry have a block_number field.

                // TODO:
                // Keep track of the latest block number fetched, to be the
                // next "from" at the next iteration.

            } else {
                println!("Error at getting logs...! {:?}", maybe_eth_logs);
            }

            // let event_signature = keccak256(b"OwnershipTransferred(address,address)");
            // println!("{}", event_signature.to_string());

            time::sleep(Duration::from_secs(self.config.fetch_interval)).await;
        }
    }
}
