use anyhow::{anyhow, Result};
use ethers::abi::RawLog;
use ethers::prelude::*;

use serde_json::{json, Value};

use crate::storage::{BridgeChain, Event, EventLabel, Request};

///
#[derive(Debug, PartialEq, Eq, EthEvent)]
pub struct DepositRequestInitiated {
    #[ethevent(indexed)]
    hash: U256,
    block_timestamp: U256,
    req_content: Vec<U256>,
}

///
#[derive(Debug, PartialEq, Eq, EthEvent)]
pub struct WithdrawRequestCompleted {
    #[ethevent(indexed)]
    hash: U256,
    block_timestamp: U256,
    req_content: Vec<U256>,
}

const DEPOSIT_REQUEST_INITIATED_SIG: &str =
    "0x4ecaf4a99ef1a36d5c1967133fb3f251e98f89361d2b43ee590c283171051b8c";

const WITHDRAW_REQUEST_COMPLETED_SIG: &str =
    "0x1969477bb1c714c2de347e8b12129f967163d2cdd4bbc4a0d1e0f062211d86ed";

const COLLECTION_DEPOYED_FROM_L2_SIG: &str =
    "0xf1653c653aee21ff13e04dc08fdab8b953d980fc4d17e032af195883a4623245";

// TODO: Check how to rework this get_store_data.
// We can have an event only, and no associated request (ex: collection deployed).

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
            event.req_hash = format!("{:#64x}", data.hash);
            event.block_timestamp = data.block_timestamp.try_into().unwrap();

            request = request_from_log_data(data.req_content)?;
        }
        WITHDRAW_REQUEST_COMPLETED_SIG => {
            let data = <WithdrawRequestCompleted as EthLogDecode>::decode_log(&raw)?;
            event.label = EventLabel::WithdrawCompletedL1;
            event.req_hash = format!("{:#64x}", data.hash);
            event.block_timestamp = data.block_timestamp.try_into().unwrap();

            request = request_from_log_data(data.req_content)?;
        }
        COLLECTION_DEPOYED_FROM_L2_SIG => {
            // TODO: return event only.
            log::debug!("Collection deployed from L2 {:?}", log);
            return Ok((None, None));
        }
        _ => {
            log::debug!("not handled log\n{:?}\n", log);
            return Ok((None, None))
        },
    };

    assert_eq!(request.hash, event.req_hash);

    Ok((Some(request), Some(event)))
}

/// From the raw buffer in the Log data, parse the request fields
/// required to build `Request`.
fn request_from_log_data(data: Vec<U256>) -> Result<Request> {
    if data.len() < 6 {
        return Err(anyhow!(
            "Request can't be extracted from log data: {:?}",
            data
        ));
    }

    let hex_strings: Vec<String> = data.iter().map(|u256| format!("{:#x}", u256)).collect();
    let content_array: Vec<Value> = hex_strings.iter().map(|s| json!(s)).collect();
    let content = serde_json::to_string(&content_array)?;

    // TODO: if it's a withdraw or deposit, the values for the collection_src etc..
    // will differ.
    // Need to be checked.
    // We still need to insert the request even if it's a withdraw as the indexer
    // on starknet side may be slower/faster, and we don't want to depend on the other
    // side indexation.

    Ok(Request {
        hash: format!("{:#032x}{:032x}", data[2], data[1]),
        chain_src: BridgeChain::Ethereum,
        collection_src: hex_strings[3].clone(),
        collection_dst: hex_strings[4].clone(),
        from: hex_strings[5].clone(),
        to: hex_strings[6].clone(),
        content,
    })
}
