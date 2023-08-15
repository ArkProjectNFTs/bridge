use anyhow::Result;
use ethers::prelude::*;
use ethers::abi::RawLog;

use crate::storage::{Request, Event, EventLabel};

/// Event expected from the bridge.
#[derive(Debug, PartialEq, Eq, EthEvent)]
pub struct DepositRequestInitiated {
    #[ethevent(indexed)]
    hash: U256,
    block_timestamp: U256,
    req_content: Vec<U256>,
}

const DEPOSIT_REQUEST_INITIATED_SIG: &str = "0x4ecaf4a99ef1a36d5c1967133fb3f251e98f89361d2b43ee590c283171051b8c";

///
pub fn get_store_data(log: Log) -> Result<(Option<Request>, Option<Event>)> {
    // Check topic + parse.
    let raw: RawLog = log.clone().into();

    let mut event = Event {
        req_hash: String::from(""),
        label: EventLabel::DepositInitiatedL1,
        block_timestamp: 0,
        block_number: log.block_number.unwrap().try_into().unwrap(),
        tx_hash: format!("{:?}", log.transaction_hash),
    };

    match format!("{:?}", raw.topics[0]).as_str() {
        DEPOSIT_REQUEST_INITIATED_SIG => {
            let data = <DepositRequestInitiated as EthLogDecode>::decode_log(&raw)?;
            event.label = EventLabel::DepositInitiatedL1;
            event.req_hash = format!("{:?}", data.hash);
            event.block_timestamp = data.block_timestamp.try_into().unwrap();
        }
        _ => return Ok((None, None)),
    };

    // TODO: parsing from Vec<U256> + convert the vec into json.
    let request: Request = Default::default();

    Ok((Some(request), Some(event)))
}
