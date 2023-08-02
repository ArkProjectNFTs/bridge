use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BridgeRequestStatus {
    InitiatedL1Success,
    InitiatedL1Error,
    ReceivedL1Success,
    ReceivedL1Error,
    ClaimReadyL1Success,
    ClaimReadyL1Error,
    ClaimedL1Success,
    ClaimedL1Error,

    InitiatedL2Success,
    InitiatedL2Error,
    ReceivedL2Success,
    ReceivedL2Error,
    ProcessedL2Success,
    ProcessedL2Error,
}

impl ToString for BridgeRequestStatus {
    fn to_string(&self) -> String {
        match self {
            BridgeRequestStatus::InitiatedL1Success => String::from("initiated_l1_ok"),
            BridgeRequestStatus::InitiatedL1Error => String::from("initiated_l1_error"),
            BridgeRequestStatus::ReceivedL1Success => String::from("received_l1_ok"),
            BridgeRequestStatus::ReceivedL1Error => String::from("received_l1_error"),
            BridgeRequestStatus::ClaimReadyL1Success => String::from("claim_ready_l1_ok"),
            BridgeRequestStatus::ClaimReadyL1Error => String::from("claim_ready_l1_error"),
            BridgeRequestStatus::ClaimedL1Success => String::from("claimed_l1_ok"),
            BridgeRequestStatus::ClaimedL1Error => String::from("claimed_l1_error"),

            BridgeRequestStatus::InitiatedL2Success => String::from("initiated_l2_ok"),
            BridgeRequestStatus::InitiatedL2Error => String::from("initiated_l2_error"),
            BridgeRequestStatus::ReceivedL2Success => String::from("received_l2_ok"),
            BridgeRequestStatus::ReceivedL2Error => String::from("received_l2_error"),
            BridgeRequestStatus::ProcessedL2Success => String::from("processed_l2_ok"),
            BridgeRequestStatus::ProcessedL2Error => String::from("processed_l2_error"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BridgeRequest {
    // Request's hash, unique identifier through source and destination chains.
    pub hash: String,
    // Source chain.
    pub chain_src: String,
    // Wallet originating the request on the source chain.
    pub from: String,
    // Wallet receiving the assets on the destination chain.
    pub to: String,
    // Address of the collection modified by this request.
    pub collection: String,
    // Full raw content of the request (JSON). Contains the request's hash
    // and header too. It aims at being used mostly to claim the message on L1.
    pub content: String,
}

/// Records a status change.
#[derive(Debug, Serialize, Deserialize)]
pub struct StatusChange {
    // The status of the request.
    pub to_status: BridgeRequestStatus,
    // Block timestamp containing the event associated with the status change.
    pub time: u64,
    // Transaction hash which triggered the status change.
    pub tx_hash: String,
}
