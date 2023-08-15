use anyhow::Result;

pub mod storage;
pub mod utils;
pub mod config;
pub mod starknet_indexer;
pub mod ethereum_indexer;

use storage::{mongo::MongoStore};

use ethereum_indexer::EthereumIndexer;
use starknet_indexer::StarknetIndexer;

use crate::config::StarklaneIndexerConfig;

use clap::Parser;
use std::sync::Arc;


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

    let args = Args::parse();
    let config = StarklaneIndexerConfig::from_file(&args.config_file)
        .expect("Config couldn't be loaded");

    let mongo_store =
        Arc::new(MongoStore::new(&args.mongodb, "starklane").await?);

    let eth_store = Arc::clone(&mongo_store);
    let sn_store = Arc::clone(&mongo_store);

    let eth_indexer = EthereumIndexer::new(config.ethereum.clone()).await
        .expect("Ethereum indexer couldn't be created");

    let sn_indexer = StarknetIndexer::new(config.starknet.clone()).await
        .expect("Starknet indexer couldn't be created");

    // If requested -> start API to serve data from the store.

    let eth_handle = tokio::spawn(async move {
        let _ = eth_indexer.start::<MongoStore>(eth_store).await;
    });

    let sn_handle = tokio::spawn(async move {
        sn_indexer.start::<MongoStore>(sn_store).await;
    });

    println!("waiting...");
    // Wait for tasks to complete

    let (_eth_res, _sn_res) = tokio::join!(eth_handle, sn_handle);

    Ok(())
}
