//! Starklane indexer main entry point.
extern crate config as external_crate_config;

use crate::config::StarklaneIndexerConfig;
use anyhow::Result;
use axum::{http::Request, middleware::Next, response::Response, routing::get, Router, Server};
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
pub mod price;
pub mod starknet_indexer;
pub mod storage;
pub mod utils;

const ENV_PREFIX: &'static str = "INDEXER";
const ENV_SEPARATOR: &'static str = "__"; // "_" can't be used since we have key with '_' in json

#[derive(Parser, Debug)]
#[clap(about = "Starklane indexer")]
struct Args {
    #[clap(long, help = "Configuration file (JSON)", env = format!("{}{}CONFIG_FILE", ENV_PREFIX, ENV_SEPARATOR))]
    config_file: String,

    #[clap(long, help = "Mongo db connection string", env = format!("{}{}MONGODB_URI", ENV_PREFIX, ENV_SEPARATOR))]
    mongodb: String,

    #[clap(long, help = "The IP to bind to start indexer api server", env = format!("{}{}SERVER_IP", ENV_PREFIX, ENV_SEPARATOR))]
    api_server_ip: Option<String>,
}

#[derive(Clone, Debug)]
pub struct ChainsBlocks {
    sn: u64,
    eth: u64,
}

async fn version_header<B>(req: Request<B>, next: Next<B>) -> Response {
    let mut response = next.run(req).await;
    response
        .headers_mut()
        .insert("X-INDEXER-VERSION", env!("GIT_HASH").parse().unwrap());
    response
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();

    let args = Args::parse();
    let settings = external_crate_config::Config::builder()
        .add_source(external_crate_config::File::new(
            &args.config_file,
            external_crate_config::FileFormat::Json,
        ))
        .add_source(
            external_crate_config::Environment::with_prefix(ENV_PREFIX)
                .try_parsing(true)
                .separator(ENV_SEPARATOR),
        )
        .build()
        .unwrap();

    let config: StarklaneIndexerConfig = settings
        .try_deserialize()
        .expect("Failed to retrieve configuration");

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
        config.ethereum.clone().bridge_address,
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
            l1_address: config.ethereum.bridge_address,
            l2_address: config.starknet.bridge_address,
            chains_blocks: Arc::clone(&chains_blocks),
        };

        let app = Router::new()
            .route("/requests/:wallet", get(requests::reqs_info_from_wallet))
            .route("/tx/:txhash", get(requests::transaction))
            .route("/info", get(requests::info))
            .route(
                "/stats/:eth_contract_address",
                get(requests::contract_stats),
            )
            .layer(axum::middleware::from_fn(version_header))
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
