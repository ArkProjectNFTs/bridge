use serde::{Deserialize, Serialize};
use crate::utils::BridgeChain;

/// Request sent on the bridge.
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Request {
    // Request's hash, unique identifier through source and destination chains.
    pub hash: String,
    // Source chain.
    pub chain_src: BridgeChain,
    // Wallet originating the request on the source chain.
    pub from: String,
    // Wallet receiving the assets on the destination chain.
    pub to: String,
    // Address of the collection associated to this request.
    pub collection: String,
    // Raw content of the request (JSON) in it's serialized form.
    pub content: String,
}

/// Records event associated to requests.
#[derive(Debug, Serialize, Deserialize)]
pub struct Event {
    // The event label.
    pub label: EventLabel,
    // Block timestamp containing the event associated with the status change.
    pub block_timestamp: u64,
    // The block number associated with the event emission.
    pub block_number: u64,
    // Transaction hash of the transaction which triggered the event.
    pub tx_hash: String,
}

///
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EventLabel {
    DepositInitiatedL1,
    WithdrawAvailableL1,
    WithdrawCompletedL1,
    TransitErrorL1L2,

    DepositInitiatedL2,
    WithdrawCompletedL2,
    TransitErrorL2L1,
}

///
impl ToString for EventLabel {
    fn to_string(&self) -> String {
        match self {
            EventLabel::DepositInitiatedL1 => String::from("deposit_initiated_l1"),
            EventLabel::WithdrawAvailableL1 => String::from("withdraw_available_l1"),
            EventLabel::WithdrawCompletedL1 => String::from("withdraw_completed_l1"),
            EventLabel::TransitErrorL1L2 => String::from("transit_error_l1_l2"),

            EventLabel::DepositInitiatedL2 => String::from("deposit_initiated_l2"),
            EventLabel::WithdrawCompletedL2 => String::from("withdraw_completed_l2"),
            EventLabel::TransitErrorL2L1 => String::from("transit_error_l2_l1"),
        }
    }
}
