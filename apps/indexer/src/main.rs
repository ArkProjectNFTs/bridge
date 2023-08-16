//! Starklane indexer main entry point.

use anyhow::Result;
use clap::Parser;
use std::sync::Arc;

use crate::config::StarklaneIndexerConfig;
use ethereum_indexer::EthereumIndexer;
use starknet_indexer::StarknetIndexer;
use storage::mongo::MongoStore;

pub mod config;
pub mod ethereum_indexer;
pub mod starknet_indexer;
pub mod storage;
pub mod utils;

#[derive(Parser, Debug)]
#[clap(about = "Starklane indexer")]
struct Args {
    #[clap(long, help = "Configuration file (JSON)")]
    config_file: String,

    #[clap(long, help = "Mongo db connection string")]
    mongodb: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();

    let args = Args::parse();
    let config =
        StarklaneIndexerConfig::from_file(&args.config_file).expect("Config couldn't be loaded");

    let mongo_store = Arc::new(MongoStore::new(&args.mongodb, "starklane").await?);

    let eth_indexer =
        EthereumIndexer::<MongoStore>::new(config.ethereum.clone(), Arc::clone(&mongo_store))
            .await?;

    let sn_indexer =
        StarknetIndexer::<MongoStore>::new(config.starknet.clone(), Arc::clone(&mongo_store))
            .await?;

    // If requested -> start API to serve data from the store.

    let eth_handle = tokio::spawn(async move {
        match eth_indexer.start().await {
            Ok(()) => {
                log::info!("Normal termination of eth indexer after indexing requested blocks.")
            }
            Err(e) => log::error!("Error during eth indexer loop: {:?}", e),
        }
    });

    let sn_handle = tokio::spawn(async move {
        match sn_indexer.start().await {
            Ok(()) => {
                log::info!("Normal termination of sn indexer after indexing requested blocks.")
            }
            Err(e) => log::error!("Error during sn indexer loop: {:?}", e),
        }
    });

    // Wait for tasks to complete
    let (_eth_res, _sn_res) = tokio::join!(eth_handle, sn_handle);

    Ok(())
}
