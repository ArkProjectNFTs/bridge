use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};

use super::AppState;
use crate::storage::{
    store::{EventStore, RequestStore},
    Event, Request,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct RequestInfo {
    req: Request,
    events: Vec<Event>,
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

pub async fn transaction(
    Path(txhash): Path<String>,
    state: State<AppState>,
) -> StatusCode {
    if let Ok(event) = state.store.event_by_tx(&txhash.to_lowercase()).await {
        if event.is_some() {
            return StatusCode::OK;
        }
    } 
    StatusCode::NOT_FOUND
}