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
use regex::Regex;

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

        let from_block = parse_block_id(&self.config.from_block)
            .expect("Starknet: can't deserialize from_block");

        let to_block = if let Some(to) = &self.config.to_block {
            parse_block_id(&to).expect("Starknet: can't deserialize to_block")
        } else {
            BlockId::Tag(BlockTag::Latest)
        };
        
        loop {
            let maybe_sn_events = self.client.fetch_events(
                from_block,
                to_block,
                addr).await;

            if let Ok(events) = maybe_sn_events {
                println!("{:?}", events);
                // identify the events + register data in the db store.

                // TODO: we want to have a store transaction for each block.
                // This will ensure that the block is or fully processed,
                // or not processed at all.
                // The store for indexing state will register if the block is processed.
                // And block is skipped if already processed.
                //
                // To identify block, the log entry have a block_number field.
            } else {
                println!("Error at getting starknet events...! {:?}", maybe_sn_events);
            }

            time::sleep(Duration::from_secs(self.config.fetch_interval)).await;
        }
    }
}

fn parse_block_id(id: &str) -> Result<BlockId> {
    let regex_block_number = Regex::new("^[0-9]{1,}$").unwrap();

    if id == "latest" {
        Ok(BlockId::Tag(BlockTag::Latest))
    } else if id == "pending" {
        Ok(BlockId::Tag(BlockTag::Pending))
    } else if regex_block_number.is_match(id) {
        Ok(BlockId::Number(id.parse::<u64>()?))
    } else {
        Ok(BlockId::Hash(FieldElement::from_hex_be(id)?))
    }
}
