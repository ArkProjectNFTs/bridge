//! For now only mongo store is used locally,
//! Any new store can be added (i.e. dynamodb) implementing
//! the traits in store.rs.
use serde::{Deserialize, Serialize};

pub mod mongo;
pub mod protocol;
pub mod store;

///
#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub enum BridgeChain {
    #[default]
    #[serde(rename = "sn")]
    Starknet,
    #[serde(rename = "eth")]
    Ethereum,
}

///
impl ToString for BridgeChain {
    fn to_string(&self) -> String {
        match self {
            BridgeChain::Starknet => String::from("sn"),
            BridgeChain::Ethereum => String::from("eth"),
        }
    }
}

///
#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub enum CrossChainTxKind {
    #[default]
    #[serde(rename = "withdraw_auto")]
    WithdrawAuto,
    #[serde(rename = "burn_auto")]
    BurnAuto,
}

///
impl ToString for CrossChainTxKind {
    fn to_string(&self) -> String {
        match self {
            CrossChainTxKind::WithdrawAuto => String::from("withdraw_auto"),
            CrossChainTxKind::BurnAuto => String::from("burn_auto"),
        }
    }
}

///
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct CrossChainTx {
    pub chain: BridgeChain,
    pub kind: CrossChainTxKind,
    pub req_hash: String,
    pub req_content: String,
    pub tx_hash: String,
}

///
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct BlockIndex {
    pub chain: BridgeChain,
    pub block_number: u64,
    pub insert_timestamp: u64,
}

/// TODO: Need better data structure for this one...
///       we may also want the details of tokens, extracted
///       from the request content.
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct CollectionContract {
    pub chain_src: BridgeChain,
    pub address_src: String,
    pub address_dst: String,
}

/// Request sent on the bridge.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Request {
    // Request's hash, unique identifier through source and destination chains.
    pub hash: String,
    // Source chain.
    pub chain_src: BridgeChain,
    // Wallet originating the request on the source chain.
    pub from: String,
    // Wallet receiving the assets on the destination chain.
    pub to: String,
    // Address of the collection on the source chain.
    pub collection_src: String,
    // Address of the collection on the destination chain.
    pub collection_dst: String,
    // Raw content of the request (JSON) in it's serialized form.
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct EventPrice {
    pub gas: u64,
    pub usd_price: String,
}

/// Records event associated to requests.
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct Event {
    // Hash of the request associated with the event.
    pub req_hash: String,
    // The event label.
    pub label: EventLabel,
    // Block timestamp containing the event associated with the status change.
    pub block_timestamp: u64,
    // The block number associated with the event emission.
    pub block_number: u64,
    // Transaction hash of the transaction which triggered the event.
    pub tx_hash: String,
    // Transaction price
    pub price: Option<EventPrice>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StarknetBridgeRequest {
    pub collection_src: String,
    pub token_ids: Vec<String>,
    pub from: String,
    pub to: String,
    pub tx_hash: String,
    pub is_checked: bool,
}

///
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, PartialOrd, Eq, Ord, Copy)]
#[serde(rename_all = "snake_case")]
pub enum EventLabel {
    #[serde(rename = "deposit_initiated_l1")]
    DepositInitiatedL1,
    #[serde(rename = "deposit_initiated_l2")]
    DepositInitiatedL2,

    #[serde(rename = "withdraw_available_l1")]
    WithdrawAvailableL1,

    #[serde(rename = "withdraw_completed_l1")]
    WithdrawCompletedL1,
    #[serde(rename = "withdraw_completed_l2")]
    WithdrawCompletedL2,

    #[serde(rename = "transit_error_l1_l2")]
    TransitErrorL1L2,
    #[serde(rename = "transit_error_l2_l1")]
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PendingWithdraw {
    // Hash of the request associated with the event.
    pub req_hash: String,
    // Transaction hash on source chain
    pub tx_hash: String,
    // Source chain
    pub chain_src: BridgeChain,
    // timestamp
    pub timestamp: u64,

    pub message_hash: [u8; 32],
}
