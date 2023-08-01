use anyhow::Result;
use alloy_primitives::{address, Address, U256};

pub mod utils;

pub mod storage;
use storage::{BridgeRequestStatus, BridgeRequest, mongo_store::MongoStore, store::Store};

use std::time::SystemTime;

#[tokio::main]
async fn main() -> Result<()> {

    let store = MongoStore::new(
        "mongodb://127.0.0.1:27017",
        "starklane",
        "bridge_reqs").await?;


    let epoch = match SystemTime::now().duration_since(SystemTime::UNIX_EPOCH) {
        Ok(n) => n.as_secs(),
        Err(_) => panic!("SystemTime before UNIX EPOCH!"),
    };

    let req = BridgeRequest {
        hash: format!("{}", epoch),
        header: String::from("0"),
        time: 1,
        chain_src: String::from("eth"),
        chain_dst: String::from("sn"),
        from: String::from("0x22"),
        to: String::from("0x33"),
        content: String::from("[1324, 234]"),
        status: BridgeRequestStatus::SrcSubmitted,
        status_updates: vec![],
    };

    store.req_save(&req).await?;

    let r = store.req_by_hash("1690863218").await?;
    println!("REQ! {:?}", r);

    store.req_status_set(r.unwrap().hash.as_str(), BridgeRequestStatus::DstSuccess).await?;

    let reqs = store.req_by_wallet("0x33").await?;
    println!("REQS! {:?}", reqs);

    let mut n: U256 = "42".parse().unwrap();
    n += U256::from(10);
    assert_eq!(n.to_string(), "52");

    let addr_str = "0x66f9664f97F2b50F62D13eA064982f936dE76657";
    let addr: Address = Address::parse_checksummed(addr_str, None).unwrap();
    assert_eq!(addr, address!("66f9664f97F2b50F62D13eA064982f936dE76657"));
    assert_eq!(addr.to_checksum(None), addr_str);

    println!("Hello, world! {:?}", addr);

    Ok(())
}
