use crate::storage::{BridgeChain, CrossChainTx, CrossChainTxKind, Event, EventLabel, Request};
use crate::utils::normalize_hex;
use anyhow::{anyhow, Result};
use serde_json::{json, Value};
use starknet::core::{types::FieldElement, types::*};
use starknet::macros::selector;

pub const DEPOSIT_REQUEST_INITIATED_SELECTOR: &str =
    "0x1682ccdc90fbee2d6cc3e930539cb4ca29390a438db1c2e4c7d493e01a61abb";

pub const WITHDRAW_REQUEST_COMPLETED_SELECTOR: &str =
    "0x132aab9714c265c8ad151ce006bb91691100722ddec42e7ee96dc9dfa9e741c";

pub const REQUEST_HEADER_WITHDRAW_AUTO: u128 = 0x01000000;
pub const REQUEST_HEADER_BURN_AUTO: u128 = 0x010000;

///
pub fn get_store_data(
    event: EmittedEvent,
) -> Result<(Option<Request>, Option<Event>, Option<CrossChainTx>)> {
    // keys[0] -> selector.
    // keys[1,2] -> req hash.
    // keys[3] -> timestamp.
    if event.keys[0] == selector!("CollectionDeployedFromL1") {
        return Ok((None, None, None));
    }
    if event.keys.len() < 4 || event.data.is_empty() {
        log::debug!("not handled event: {:?}", event.keys);
        return Ok((None, None, None));
    }

    let hash = u256_to_hex(&event.keys[1..])?;
    let block_timestamp = event.keys[3];
    let request_header = event.data[0];

    let mut store_event = Event {
        req_hash: hash.clone(),
        label: EventLabel::DepositInitiatedL2,
        block_timestamp: block_timestamp.try_into()?,
        block_number: event.block_number,
        tx_hash: felt_to_hex(&event.transaction_hash),
        price: None,
    };

    let tx;

    match felt_to_hex(&event.keys[0]).as_str() {
        DEPOSIT_REQUEST_INITIATED_SELECTOR => {
            store_event.label = EventLabel::DepositInitiatedL2;

            let request = request_from_event_data(&store_event.label, event.data)?;

            tx = get_xchain_tx_withdraw(
                request_header,
                request.hash.clone(),
                request.content.clone(),
            )?;

            assert_eq!(request.hash, store_event.req_hash);
            Ok((Some(request), Some(store_event), tx))
        }
        WITHDRAW_REQUEST_COMPLETED_SELECTOR => {
            store_event.label = EventLabel::WithdrawCompletedL2;

            let request = request_from_event_data(&store_event.label, event.data)?;

            // TODO: burn txs.

            assert_eq!(request.hash, store_event.req_hash);
            Ok((Some(request), Some(store_event), None))
        }
        _ => Ok((None, None, None)),
    }
}

/// From the raw buffer in the event data, parse the request fields
/// required to build `Request`.
fn request_from_event_data(event_label: &EventLabel, data: Vec<FieldElement>) -> Result<Request> {
    // First 7 felts are the fixed size part of the request.
    if data.len() < 7 {
        return Err(anyhow!(
            "Request can't be extracted from event data: {:?}",
            data
        ));
    }

    let content_array: Vec<Value> = data.iter().map(|f| json!(felt_to_hex(f))).collect();
    let content = serde_json::to_string(&content_array)?;

    let req = match event_label {
        EventLabel::DepositInitiatedL2 => Request {
            hash: u256_to_hex(&data[1..])?, // first felt is the header.
            chain_src: BridgeChain::Starknet,
            collection_src: normalize_hex(felt_to_hex(&data[4]).as_str())?, // collection l2
            collection_dst: normalize_hex(felt_to_hex(&data[3]).as_str())?, // collection l1
            from: normalize_hex(felt_to_hex(&data[6]).as_str())?,           // owner l2
            to: normalize_hex(felt_to_hex(&data[5]).as_str())?,             // owner l1
            content,
        },
        EventLabel::WithdrawCompletedL2 => Request {
            hash: u256_to_hex(&data[1..])?, // first felt is the header.
            chain_src: BridgeChain::Ethereum,
            collection_src: normalize_hex(felt_to_hex(&data[3]).as_str())?, // collection l1
            collection_dst: normalize_hex(felt_to_hex(&data[4]).as_str())?, // collection l2
            from: normalize_hex(felt_to_hex(&data[5]).as_str())?,           // owner l1
            to: normalize_hex(felt_to_hex(&data[6]).as_str())?,             // owner l2
            content,
        },
        _ => {
            return Err(anyhow!(
                "EventLabel {:?} not supposed to generate a request",
                event_label
            ))
        }
    };

    Ok(req)
}

///
fn get_xchain_tx_withdraw(
    header: FieldElement,
    req_hash: String,
    req_content: String,
) -> Result<Option<CrossChainTx>> {
    // For now, header must be convertible into u128.
    let h: u128 = header.try_into()?;

    let can_withdraw_auto = h & REQUEST_HEADER_WITHDRAW_AUTO == REQUEST_HEADER_WITHDRAW_AUTO;

    if can_withdraw_auto {
        Ok(Some(CrossChainTx {
            chain: BridgeChain::Ethereum,
            kind: CrossChainTxKind::WithdrawAuto,
            req_hash: req_hash.clone(),
            req_content: req_content.clone(),
            tx_hash: String::from(""),
        }))
    } else {
        Ok(None)
    }
}

/// Always with leading 0 for u256.
fn u256_to_hex(felts: &[FieldElement]) -> Result<String> {
    if felts.len() < 2 {
        return Err(anyhow!("At least two felts are required to read a u256"));
    }

    Ok(format!("0x{:032x}{:032x}", felts[1], felts[0]))
}

///
#[inline(always)]
fn felt_to_hex(fe: &FieldElement) -> String {
    format!("{:#64x}", fe)
}
