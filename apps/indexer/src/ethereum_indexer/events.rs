use anyhow::{Result, anyhow};
use ethers::prelude::*;
use ethers::abi::RawLog;

use serde_json::{json, Value};

use crate::storage::{Request, Event, EventLabel, BridgeChain};

/// Event expected from the bridge.
#[derive(Debug, PartialEq, Eq, EthEvent)]
pub struct DepositRequestInitiated {
    #[ethevent(indexed)]
    hash: U256,
    block_timestamp: U256,
    req_content: Vec<U256>,
}

const DEPOSIT_REQUEST_INITIATED_SIG: &str = "0x4ecaf4a99ef1a36d5c1967133fb3f251e98f89361d2b43ee590c283171051b8c";

/// Returns storage data from the log entry.
pub fn get_store_data(log: Log) -> Result<(Option<Request>, Option<Event>)> {
    // Check topic + parse.
    let raw: RawLog = log.clone().into();

    let mut event = Event {
        req_hash: String::from(""),
        label: EventLabel::DepositInitiatedL1,
        block_timestamp: 0,
        block_number: log.block_number.unwrap().try_into().unwrap(),
        tx_hash: format!("{:#x}", log.transaction_hash.unwrap()),
    };

    // TODO: not a fan of the mut here and for event, but as the type of data can change,
    // if someone has a better rust knowlege as mine for now,
    // rework very welcome!
    let request;

    match format!("{:?}", raw.topics[0]).as_str() {
        DEPOSIT_REQUEST_INITIATED_SIG => {
            let data = <DepositRequestInitiated as EthLogDecode>::decode_log(&raw)?;
            event.label = EventLabel::DepositInitiatedL1;
            event.req_hash = format!("{:#x}", data.hash);
            event.block_timestamp = data.block_timestamp.try_into().unwrap();

            request = request_from_log_data(data.req_content)?;
        }
        _ => return Ok((None, None)),
    };

    assert_eq!(request.hash, event.req_hash);

    Ok((Some(request), Some(event)))
}

/// From the raw buffer in the Log data, parse the request fields
/// required to build `Request`.
fn request_from_log_data(data: Vec<U256>) -> Result<Request> {
    if data.len() < 6 {
        return Err(anyhow!("Request can't be extracted from log data: {:?}", data));
    }

    let hex_strings: Vec<String> = data.iter().map(|u256| format!("{:#x}", u256)).collect();
    let content_array: Vec<Value> = hex_strings.iter().map(|s| json!(s)).collect();
    let content = serde_json::to_string(&content_array)?;

    Ok(Request {
        hash: format!("{}{}", hex_strings[2], hex_strings[1].strip_prefix("0x").unwrap()),
        chain_src: BridgeChain::Ethereum,
        collection_src: hex_strings[3].clone(),
        collection_dst: hex_strings[4].clone(),
        from: hex_strings[5].clone(),
        to: hex_strings[6].clone(),
        content,
    })
}
