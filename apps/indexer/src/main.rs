//! Starklane indexer main entry point.

use crate::config::StarklaneIndexerConfig;
use anyhow::Result;
use axum::{routing::get, Router, Server};
use clap::Parser;
use ethereum_indexer::EthereumIndexer;
use handlers::{requests, AppState};
use starknet_indexer::StarknetIndexer;
use std::sync::Arc;
use storage::mongo::MongoStore;
use tokio::sync::RwLock as AsyncRwLock;

pub mod config;
pub mod ethereum_indexer;
pub mod handlers;
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

    #[clap(long, help = "The IP to bind to start indexer api server")]
    api_server_ip: Option<String>,
}

#[derive(Clone, Debug)]
pub struct ChainsBlocks {
    sn: u64,
    eth: u64,
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();

    let args = Args::parse();
    let config =
        StarklaneIndexerConfig::from_file(&args.config_file).expect("Config couldn't be loaded");

    let dbname = extract_database_name(&args.mongodb)
        .expect("Database name couldn't be extracted from the connection string");

    let mongo_store = Arc::new(MongoStore::new(&args.mongodb, dbname).await?);

    let chains_blocks = Arc::new(AsyncRwLock::new(ChainsBlocks { sn: 0, eth: 0 }));

    let eth_indexer = EthereumIndexer::<MongoStore>::new(
        config.ethereum.clone(),
        Arc::clone(&mongo_store),
        Arc::clone(&chains_blocks),
        config.xchain_txor,
    )
    .await?;

    let sn_indexer = StarknetIndexer::<MongoStore>::new(
        config.starknet.clone(),
        Arc::clone(&mongo_store),
        Arc::clone(&chains_blocks),
    )
    .await?;

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

    let api_handle = tokio::spawn(async move {
        if args.api_server_ip.is_none() {
            return;
        }

        let app_state = AppState {
            store: Arc::clone(&mongo_store),
        };

        let app = Router::new()
            .route("/requests/:wallet", get(requests::reqs_info_from_wallet))
            .with_state(app_state);

        match Server::bind(&args.api_server_ip.unwrap().parse().unwrap())
            .serve(app.into_make_service())
            .await
        {
            Ok(()) => {
                log::info!("Normal termination of indexer api.")
            }
            Err(e) => log::error!("Error indexer api: {:?}", e),
        }
    });

    // Wait for tasks to complete
    let (_eth_res, _sn_res, _api_res) = tokio::join!(eth_handle, sn_handle, api_handle);

    Ok(())
}

/// Extracts database name from connection string.
/// Expecting the database name to be the latest fragment
/// of the string after the right most '/'.
fn extract_database_name(connection_string: &str) -> Option<&str> {
    if let Some(pos) = connection_string.rfind('/') {
        let db_name_start = pos + 1;
        if let Some(pos) = connection_string[db_name_start..].find('?') {
            Some(&connection_string[db_name_start..db_name_start + pos])
        } else {
            Some(&connection_string[db_name_start..])
        }
    } else {
        None
    }
}
