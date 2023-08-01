use serde::{Deserialize, Serialize};

pub mod store;
pub mod mongo_store;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BridgeRequestStatus {
    SrcSubmitted,
    DstReceived,
    DstSuccess,
    DstError,
}

impl ToString for BridgeRequestStatus {
    fn to_string(&self) -> String {
        match self {
            BridgeRequestStatus::SrcSubmitted => String::from("src_submitted"),
            BridgeRequestStatus::DstReceived => String::from("dst_received"),
            BridgeRequestStatus::DstSuccess => String::from("dst_success"),
            BridgeRequestStatus::DstError => String::from("dst_error"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BridgeRequest {
    // Request's hash, unique identifier through source and destination chains.
    pub hash: String,
    // Request's header, containing info about the request.
    pub header: String,
    // Timestamp of block originating the request.
    pub time: u64,
    // Source chain.
    pub chain_src: String,
    // Destination chain.
    pub chain_dst: String,
    // Wallet originating the request on the source chain.
    pub from: String,
    // Wallet receiving the assets on the destination chain.
    pub to: String,
    // Full raw content of the request (JSON). Contains the request's hash
    // and header too. It aims at being used mostly to claim the message on L1.
    pub content: String,
    // Status of the request.
    pub status: BridgeRequestStatus,
    // TODO: keep track of the status changes to monitor network speed etc...
    // TODO: must be private, but too lazy now to implement a new with all arguments.
    pub status_updates: Vec<(u64, BridgeRequestStatus)>,
}
