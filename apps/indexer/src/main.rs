use alloy_primitives::{address, Address, U256, keccak256};
use anyhow::Result;

pub mod bridge_request;
pub mod storage;
pub mod events;
pub mod utils;

use bridge_request::{BridgeRequest, BridgeRequestStatus, StatusChange};
use storage::{mongo::request_store::MongoRequestStore, store::BridgeRequestStore};
use std::time::SystemTime;
use events::ethereum::EthereumClient;

#[tokio::main]
async fn main() -> Result<()> {

    let addr_str = "0x7F435bC17d2eD2954142449b4BD71D151cDFb141";
    let addr: Address = Address::parse_checksummed(addr_str, None).unwrap();

    let rpc_url = "https://goerli.infura.io/v3/d8088a2c561f4641bcc0f788e631804b";
    let eth_client = EthereumClient::new(rpc_url).expect("Can't init eth client");

    let eth_logs = eth_client.fetch_logs("0x89440", "0x9021bf", addr).await?;
    println!("{:?}", eth_logs);

    let event_signature = keccak256(b"OwnershipTransferred(address,address)");
    println!("{}", event_signature.to_string());

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
