use crate::{
    storage::{BridgeChain, CrossChainTx, CrossChainTxKind, Event, EventLabel, Request},
    utils::normalize_hex,
};
use anyhow::{anyhow, Result};
use ethers::prelude::*;
use serde_json::{json, Value};

// TODO: refacto this to be common with starknet.
pub const REQUEST_HEADER_WITHDRAW_AUTO: u128 = 0x01000000;
pub const REQUEST_HEADER_BURN_AUTO: u128 = 0x010000;

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
pub fn get_store_data(log: Log) -> Result<(Option<Request>, Option<Event>, Option<CrossChainTx>)> {
    if log.topics.len() < 2 {
        log::debug!("not handled log\n{:?}\n", log);
        return Ok((None, None, None));
    }
    let sig = format!("{:#64x}", log.topics[0]);
    let req_hash = format!("{:#64x}", log.topics[1]);

    let mut event = Event {
        req_hash,
        label: EventLabel::DepositInitiatedL1,
        block_timestamp: 0,
        block_number: log.block_number.unwrap().try_into().unwrap(),
        tx_hash: format!("{:#x}", log.transaction_hash.unwrap()),
        price: None,
    };

    // TODO: not a fan of the mut here and for event, but as the type of data can change,
    // if someone has a better rust knowlege as mine for now,
    // rework very welcome!
    let request;
    let tx;

    match sig.as_str() {
        DEPOSIT_REQUEST_INITIATED_SIG => {
            let data = <DepositRequestInitiated as EthLogDecode>::decode_log(&log.clone().into())?;
            event.label = EventLabel::DepositInitiatedL1;
            event.block_timestamp = data.block_timestamp.try_into().unwrap();

            request = request_from_log_data(&event.label, data.req_content)?;
            // TODO: burn txs.
            tx = None;
        }
        WITHDRAW_REQUEST_COMPLETED_SIG => {
            let data = <WithdrawRequestCompleted as EthLogDecode>::decode_log(&log.clone().into())?;
            event.label = EventLabel::WithdrawCompletedL1;
            event.block_timestamp = data.block_timestamp.try_into().unwrap();

            let h: u128 = data.req_content[0]
                .try_into()
                .expect("Can't convert header to u128");
            let is_withdraw_auto = h & REQUEST_HEADER_WITHDRAW_AUTO == REQUEST_HEADER_WITHDRAW_AUTO;

            request = request_from_log_data(&event.label, data.req_content)?;

            if event.label == EventLabel::WithdrawCompletedL1 && is_withdraw_auto {
                tx = Some(CrossChainTx {
                    chain: BridgeChain::Ethereum,
                    kind: CrossChainTxKind::WithdrawAuto,
                    req_hash: request.hash.clone(),
                    req_content: request.content.clone(),
                    tx_hash: event.tx_hash.clone(),
                });
            } else {
                tx = None;
            }
        }
        COLLECTION_DEPOYED_FROM_L2_SIG => {
            // TODO: return event only.
            log::debug!("Collection deployed from L2 {:?}", log);
            return Ok((None, None, None));
        }
        _ => {
            log::debug!("not handled log\n{:?}\n", log);
            return Ok((None, None, None));
        }
    };

    assert_eq!(request.hash, event.req_hash);

    Ok((Some(request), Some(event), tx))
}

/// From the raw buffer in the Log data, parse the request fields
/// required to build `Request`.
fn request_from_log_data(event_label: &EventLabel, data: Vec<U256>) -> Result<Request> {
    if data.len() < 6 {
        return Err(anyhow!(
            "Request can't be extracted from log data: {:?}",
            data
        ));
    }

    let hex_strings: Vec<String> = data.iter().map(|u256| format!("{:#x}", u256)).collect();
    let content_array: Vec<Value> = hex_strings.iter().map(|s| json!(s)).collect();
    let content = serde_json::to_string(&content_array)?;

    let req = match event_label {
        EventLabel::DepositInitiatedL1 => Request {
            hash: format!("0x{:032x}{:032x}", data[2], data[1]),
            chain_src: BridgeChain::Ethereum,
            collection_src: normalize_hex(hex_strings[3].clone().as_str())?,
            collection_dst: normalize_hex(hex_strings[4].clone().as_str())?,
            from: normalize_hex(hex_strings[5].clone().as_str())?,
            to: normalize_hex(hex_strings[6].clone().as_str())?,
            content,
        },
        EventLabel::WithdrawCompletedL1 => Request {
            hash: format!("0x{:032x}{:032x}", data[2], data[1]),
            chain_src: BridgeChain::Starknet,
            collection_src: normalize_hex(hex_strings[4].clone().as_str())?,
            collection_dst: normalize_hex(hex_strings[3].clone().as_str())?,
            from: normalize_hex(hex_strings[6].clone().as_str())?,
            to: normalize_hex(hex_strings[5].clone().as_str())?,
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
