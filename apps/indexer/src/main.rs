use anyhow::Result;
use alloy_primitives::{address, Address, U256};

pub mod bridge_request;
pub mod utils;
pub mod storage;

use bridge_request::{BridgeRequestStatus, BridgeRequest, StatusChange};
use storage::{mongo::request_store::MongoRequestStore, store::BridgeRequestStore};

use std::time::SystemTime;

#[tokio::main]
async fn main() -> Result<()> {

    let req_store = MongoRequestStore::new(
        "mongodb://127.0.0.1:27017",
        "starklane",
        "bridge_reqs").await?;

    let epoch = match SystemTime::now().duration_since(SystemTime::UNIX_EPOCH) {
        Ok(n) => n.as_secs(),
        Err(_) => panic!("SystemTime before UNIX EPOCH!"),
    };

    let hash = format!("{}", epoch);

    let req = BridgeRequest {
        hash: hash.clone(),
        header: String::from("0"),
        chain_src: String::from("eth"),
        from: String::from("0x22"),
        to: String::from("0x33"),
        content: String::from("[1324, 234]"),
    };

    req_store.insert(req).await?;
    req_store.status_set(&hash, BridgeRequestStatus::SrcSubmitted, utils::utc_now_seconds()).await?;

    let status = req_store.status_get(&hash).await?;
    println!("STATUS! {:?}", status);

    let r = req_store.get_by_hash("1690863218").await?;
    println!("REQ! {:?}", r);

    let reqs = req_store.list_by_wallet("0x33").await?;
    println!("REQS! {:?}", reqs);

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
