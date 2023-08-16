use anyhow::{anyhow, Result};
use serde_json::{json, Value};
use starknet::core::{types::FieldElement, types::*};

use crate::storage::{BridgeChain, Event, EventLabel, Request};

const DEPOSIT_REQUEST_INITIATED_SELECTOR: &str =
    "0x01682ccdc90fbee2d6cc3e930539cb4ca29390a438db1c2e4c7d493e01a61abb";

///
pub fn get_store_data(event: EmittedEvent) -> Result<(Option<Request>, Option<Event>)> {
    let hash = format!("{:#032x}{:032x}", event.data[1], event.data[0]);

    let mut store_event = Event {
        req_hash: hash.clone(),
        label: EventLabel::DepositInitiatedL2,
        block_timestamp: event.data[2].try_into()?,
        block_number: event.block_number,
        tx_hash: felt_to_hex(&event.transaction_hash),
    };

    let request = request_from_event_data(event.data)?;

    assert_eq!(request.hash, store_event.req_hash);

    match felt_to_hex(&event.keys[0]).as_str() {
        DEPOSIT_REQUEST_INITIATED_SELECTOR => {
            store_event.label = EventLabel::DepositInitiatedL2;
        }
        _ => return Ok((None, None)),
    }

    Ok((Some(request), Some(store_event)))
}

/// From the raw buffer in the event data, parse the request fields
/// required to build `Request`.
fn request_from_event_data(data: Vec<FieldElement>) -> Result<Request> {
    // For now, the format of the data is including the request hash and the block timestamp.
    // The request hash being u256 -> 2 FieldElements.
    // The block timestamp -> 1 FieldElement.
    // The fixed size part of the request is 7 FieldElement long.
    // We then need at least 10 FieldElement.
    if data.len() < 10 {
        return Err(anyhow!(
            "Request can't be extracted from event data: {:?}",
            data
        ));
    }

    // We skip the first three values that are the hash (2 felts) and the timestamp.
    let content_array: Vec<Value> = data[3..].iter().map(|f| json!(felt_to_hex(f))).collect();
    let content = serde_json::to_string(&content_array)?;

    Ok(Request {
        hash: format!("{:#032x}{:032x}", data[1], data[0]),
        chain_src: BridgeChain::Starknet,
        collection_src: felt_to_hex(&data[6]),
        collection_dst: felt_to_hex(&data[7]),
        from: felt_to_hex(&data[8]),
        to: felt_to_hex(&data[9]),
        content,
    })
}

#[inline(always)]
fn felt_to_hex(fe: &FieldElement) -> String {
    format!("{:#064x}", fe)
}
