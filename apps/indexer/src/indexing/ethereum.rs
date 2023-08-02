use anyhow::Result;
use alloy_primitives::Address;

use crate::storage::store::{BridgeRequestStore};
use crate::events::ethereum::{EthereumClient};

use super::config::ChainConfig;

use crate::bridge_request::{BridgeRequest};

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

        loop {
            let maybe_eth_logs = self.client.fetch_logs(
                &self.config.from_block,
                &self.config.to_block,
                addr).await;

            if let Ok(logs) = maybe_eth_logs {
                println!("{:?}", logs);
                // identify the logs + register data in the db store.
            } else {
                println!("{}", "Error at getting logs...!");                    
            }
            
            // let event_signature = keccak256(b"OwnershipTransferred(address,address)");
            // println!("{}", event_signature.to_string());

            let req = BridgeRequest {
                hash: String::from("0x1234"),
                header: String::from("0"),
                chain_src: String::from("eth"),
                from: String::from("0x22"),
                to: String::from("0x33"),
                content: String::from("[1324, 234]"),
            };

            match store.insert(req).await {
                Ok(()) => {},
                Err(e) => {
                    println!("Error using the db... stopping loop");
                    break;
                }
            }

            time::sleep(Duration::from_secs(self.config.fetch_interval)).await;
        }
    }
}
