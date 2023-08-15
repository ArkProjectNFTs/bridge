use anyhow::Result;
use ethers::prelude::*;
use ethers::abi::RawLog;

///
#[derive(Debug)]
pub enum StarklaneBridgeEvent {
    DepositInitiated(DepositRequestInitiated),
    NotIdentified,
}

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
pub fn identify(log: Log) -> Result<StarklaneBridgeEvent> {
    // Check topic + parse.
    let raw: RawLog = log.into();

    match format!("{:?}", raw.topics[0]).as_str() {
        DEPOSIT_REQUEST_INITIATED_SIG => {
            let decoded = <DepositRequestInitiated as EthLogDecode>::decode_log(&raw)?;
            Ok(StarklaneBridgeEvent::DepositInitiated(decoded))
        }
        _ => Ok(StarklaneBridgeEvent::NotIdentified)
    }
}
