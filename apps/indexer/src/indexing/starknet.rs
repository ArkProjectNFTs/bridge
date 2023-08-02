use anyhow::Result;
use starknet::{
    macros::felt,
    core::{types::{FieldElement, BlockId, BlockTag}},
};

use crate::storage::store::{BridgeRequestStore};
use crate::events::starknet::{StarknetClient};

use super::config::ChainConfig;

use crate::bridge_request::{BridgeRequest};

use tokio::time::{self, Duration};
use std::sync::Arc;

///
pub struct StarknetIndexer {
    client: StarknetClient,
    config: ChainConfig,
}

impl StarknetIndexer {
    ///
    pub fn new(config: ChainConfig) -> Result<StarknetIndexer> {
        let client = StarknetClient::new(&config.rpc_url)?;

        Ok(StarknetIndexer {
            client,
            config,
        })
    }

    ///
    pub async fn start<T: BridgeRequestStore>(&self, store: Arc<T>) {

        let addr = FieldElement::from_hex_be(&self.config.address)
            .expect("Starknet: can't deserialize address");
        let from_block = serde_json::from_str(&self.config.from_block)
            .expect("Starknet: can't deserialize from_block");
        let to_block = serde_json::from_str(&self.config.to_block)
            .expect("Starknet: can't deserialize to_block");

        loop {
            let maybe_sn_events = self.client.fetch_events(
                from_block,
                to_block,
                addr).await;

            if let Ok(events) = maybe_sn_events {
                println!("{:?}", events);
                // identify the events + register data in the db store.
            } else {
                println!("{}", "Error at getting starknet events...!");
            }

            let req = BridgeRequest {
                hash: String::from("0x8888"),
                header: String::from("0"),
                chain_src: String::from("sn"),
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
