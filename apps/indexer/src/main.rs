use anyhow::Result;

pub mod bridge_request;
pub mod storage;
pub mod utils;
pub mod config;
pub mod starknet_indexer;
pub mod ethereum_indexer;

use bridge_request::{BridgeRequest, BridgeRequestStatus, StatusChange};
use storage::{mongo::request_store::MongoRequestStore};

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
        Arc::new(MongoRequestStore::new(&args.mongodb, "starklane", "bridge_reqs").await?);

    let eth_store = Arc::clone(&mongo_store);
    let sn_store = Arc::clone(&mongo_store);

    let eth_indexer = EthereumIndexer::new(config.ethereum.clone())
        .expect("Ethereum indexer couldn't be created");

    let sn_indexer = StarknetIndexer::new(config.starknet.clone()).await
        .expect("Starknet indexer couldn't be created");

    // If requested -> start API to serve data from the store.

    let eth_handle = tokio::spawn(async move {
        eth_indexer.start::<MongoRequestStore>(eth_store).await;
    });

    let sn_handle = tokio::spawn(async move {
        sn_indexer.start::<MongoRequestStore>(sn_store).await;
    });

    println!("waiting...");
    // Wait for tasks to complete

    let (_eth_res, _sn_res) = tokio::join!(eth_handle, sn_handle);


    // // ****SN EVENTS****
    // let sn_bridge_addr = felt!("0x0348c73fe84aef749add99dddccda56bee301c45b8e29a6f01db59a752b4f711");
    // let sn_rpc = "";
    // let sn_client = StarknetClient::new(sn_rpc).expect("Can't init sn client");

    // let from_block = BlockId::Number(1);
    // let to_block = BlockId::Tag(BlockTag::Latest);

    // let events = sn_client.fetch_events(from_block, to_block, sn_bridge_addr).await?;
    // println!("{:?}", events);




    // // *****ETH LOGS*****
    // let addr_str = "0x7F435bC17d2eD2954142449b4BD71D151cDFb141";
    // let addr: Address = Address::parse_checksummed(addr_str, None).unwrap();

    // let rpc_url = "";
    // let eth_client = EthereumClient::new(rpc_url).expect("Can't init eth client");

    // let eth_logs = eth_client.fetch_logs("0x89440", "0x9021bf", addr).await?;
    // println!("{:?}", eth_logs);

    // let event_signature = keccak256(b"OwnershipTransferred(address,address)");
    // println!("{}", event_signature.to_string());



    // *****MONGODB******
    // let req_store =
    //     MongoRequestStore::new("mongodb://127.0.0.1:27017", "starklane", "bridge_reqs").await?;

    // let epoch = match SystemTime::now().duration_since(SystemTime::UNIX_EPOCH) {
    //     Ok(n) => n.as_secs(),
    //     Err(_) => panic!("SystemTime before UNIX EPOCH!"),
    // };

    // let hash = format!("{}", epoch);

    // let req = BridgeRequest {
    //     hash: hash.clone(),
    //     header: String::from("0"),
    //     chain_src: String::from("eth"),
    //     from: String::from("0x22"),
    //     to: String::from("0x33"),
    //     content: String::from("[1324, 234]"),
    // };

    // req_store.insert(req).await?;
    // req_store
    //     .status_set(
    //         &hash,
    //         BridgeRequestStatus::SrcSubmitted,
    //         utils::utc_now_seconds(),
    //     )
    //     .await?;

    // let status = req_store.status_get(&hash).await?;
    // println!("STATUS! {:?}", status);

    // let r = req_store.get_by_hash("1690863218").await?;
    // println!("REQ! {:?}", r);

    // let reqs = req_store.list_by_wallet("0x33").await?;
    // println!("REQS! {:?}", reqs);

    // let mut n: U256 = "42".parse().unwrap();
    // n += U256::from(10);
    // assert_eq!(n.to_string(), "52");

    // let addr_str = "0x66f9664f97F2b50F62D13eA064982f936dE76657";
    // let addr: Address = Address::parse_checksummed(addr_str, None).unwrap();
    // assert_eq!(addr, address!("66f9664f97F2b50F62D13eA064982f936dE76657"));
    // assert_eq!(addr.to_checksum(None), addr_str);

    // println!("Hello, world! {:?}", addr);

    Ok(())
}
