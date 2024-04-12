use super::PendingWithdraw;
use super::StarknetBridgeRequest;

use crate::storage::{
    BlockIndex, BridgeChain, CrossChainTx, CrossChainTxKind, Event, EventLabel, Request,
};
use anyhow::Result;
use mongodb::{bson::Bson, options::ClientOptions, Client, Collection};

mod block_store;
mod event_store;
mod pending_withdraw_store;
mod request_store;
mod starknet_bridge_request_store;
mod xchain_tx_store;

/// Mongo db abstraction.
///
/// NOTE:
/// For now, the document type is the same as `Request` from the crate.
/// To limit coupling, it can be good in the future
/// to have a type of mongo only (MongoRequest), and implementing
/// `From<Request> for MongoRequest` among others.
/// The same applies for events.
pub struct MongoStore {
    requests: Collection<Request>,
    events: Collection<Event>,
    blocks: Collection<BlockIndex>,
    xchain_txs: Collection<CrossChainTx>,
    starknet_bridge_requests: Collection<StarknetBridgeRequest>,
    pending_withdraws: Collection<PendingWithdraw>,
}

///
impl MongoStore {
    /// Initializes a new mongo store for the given database.
    ///
    /// TODO: for now the collection names are hardcoded, could be passed
    ///       as argument?
    pub async fn new(connection_string: &str, db_name: &str) -> Result<MongoStore> {
        let client_options = ClientOptions::parse(connection_string).await?;
        let client = Client::with_options(client_options)?;
        let db = client.database(db_name);

        let requests = db.collection::<Request>("requests");
        let events = db.collection::<Event>("events");
        let blocks = db.collection::<BlockIndex>("blocks");
        let xchain_txs = db.collection::<CrossChainTx>("xchain_txs");
        let starknet_bridge_requests =
            db.collection::<StarknetBridgeRequest>("starknet_bridge_requests");
        let pending_withdraws = db.collection::<PendingWithdraw>("pending_withdraws");

        Ok(MongoStore {
            requests,
            events,
            blocks,
            xchain_txs,
            starknet_bridge_requests,
            pending_withdraws,
        })
    }
}

///
impl From<BridgeChain> for Bson {
    fn from(v: BridgeChain) -> Bson {
        Bson::String(v.to_string())
    }
}

///
impl From<Bson> for BridgeChain {
    fn from(v: Bson) -> BridgeChain {
        match v {
            Bson::String(s) => match s.as_str() {
                "sn" => BridgeChain::Starknet,
                "eth" => BridgeChain::Ethereum,
                &_ => panic!("Unknown bridge chain {:?}", s),
            },
            _ => panic!("Unsupported Bson value {:?}", v),
        }
    }
}

///
impl From<EventLabel> for Bson {
    fn from(v: EventLabel) -> Bson {
        Bson::String(v.to_string())
    }
}

///
impl From<Bson> for EventLabel {
    fn from(v: Bson) -> EventLabel {
        match v {
            Bson::String(s) => match s.as_str() {
                "deposit_initiated_l1" => EventLabel::DepositInitiatedL1,
                "withdraw_completed_l1" => EventLabel::WithdrawCompletedL1,
                "transit_error_l1_l2" => EventLabel::TransitErrorL1L2,
                "deposit_initiated_l2" => EventLabel::DepositInitiatedL2,
                "withdraw_completed_l2" => EventLabel::WithdrawCompletedL2,
                "transit_error_l2_l1" => EventLabel::TransitErrorL2L1,
                &_ => panic!("Unknown event label {:?}", s),
            },
            _ => panic!("Unsupported Bson value {:?}", v),
        }
    }
}

///
impl From<CrossChainTxKind> for Bson {
    fn from(v: CrossChainTxKind) -> Bson {
        Bson::String(v.to_string())
    }
}

///
impl From<Bson> for CrossChainTxKind {
    fn from(v: Bson) -> CrossChainTxKind {
        match v {
            Bson::String(s) => match s.as_str() {
                "withdraw_auto" => CrossChainTxKind::WithdrawAuto,
                "burn_auto" => CrossChainTxKind::BurnAuto,
                &_ => panic!("Unknown xchain tx kind {:?}", s),
            },
            _ => panic!("Unsupported Bson value {:?}", v),
        }
    }
}
