use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};

use super::AppState;
use crate::storage::{
    protocol::ProtocolParser,
    store::{EventStore, RequestStore},
    Event, Request,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct RequestInfo {
    req: Request,
    events: Vec<Event>,
    token_ids: Vec<String>,
}

/// Builds a DTO with requests and associated events.
pub async fn reqs_info_from_wallet(
    Path(wallet): Path<String>,
    state: State<AppState>,
) -> Result<Json<Vec<RequestInfo>>, (StatusCode, String)> {
    let mut dtos: Vec<RequestInfo> = vec![];

    if let Ok(reqs) = state.store.reqs_by_wallet(&wallet.to_lowercase()).await {
        for req in reqs {
            if let Ok(mut events) = state.store.events_by_request(&req.hash).await {
                // Sort enum to ensure the latest is the current status.
                events.sort_by_key(|e| e.label);

                dtos.push(RequestInfo {
                    req: req.clone(),
                    events,
                    token_ids: req.get_token_ids(),
                });
            } else {
                // TODO: maybe no need to crash here? Only skip this request?
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Error retrieving events".to_string(),
                ));
            }
        }
    } else {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            "Error retrieving requests".to_string(),
        ));
    }

    Ok(Json(dtos))
}

pub async fn transaction(Path(txhash): Path<String>, state: State<AppState>) -> StatusCode {
    if let Ok(event) = state.store.event_by_tx(&txhash.to_lowercase()).await {
        if event.is_some() {
            return StatusCode::OK;
        }
    }
    StatusCode::NOT_FOUND
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IndexerInfo {
    l1_address: String,
    l2_address: String,
    l1_block_number: u64,
    l2_block_number: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Stats {
    total_tokens_bridged_on_starknet: u64,
}

pub async fn contract_stats(
    Path(eth_contract_address): Path<String>,
    state: State<AppState>,
) -> Result<Json<Stats>, (StatusCode, String)> {
    let total_tokens_bridged_on_starknet = state
        .store
        .get_total_tokens_bridged_on_starknet(&eth_contract_address)
        .await
        .unwrap_or(0);

    let stats = Stats {
        total_tokens_bridged_on_starknet,
    };

    Ok(Json(stats))
}

pub async fn info(state: State<AppState>) -> Result<Json<IndexerInfo>, (StatusCode, String)> {
    let chains_blocks = state.chains_blocks.read().await;

    let info = IndexerInfo {
        l1_address: state.l1_address.clone(),
        l2_address: state.l2_address.clone(),
        l1_block_number: chains_blocks.eth,
        l2_block_number: chains_blocks.sn,
    };
    Ok(Json(info))
}
