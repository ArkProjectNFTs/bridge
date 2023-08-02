///! When PR like https://github.com/alloy-rs/core/pull/51
///! will be merged, eth calls will be far better with more typing.
///!

use anyhow::Result;
use alloy_primitives::{Address};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json};

/// Eth_getLogs call RPC call result.
/// https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs
/// https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EthereumLogEntry {
    pub address: String,
    pub topics: Vec<String>,
    pub data: String,
    pub block_hash: String,
    pub block_number: String,
    pub transaction_hash: String,
    pub transaction_index: String,
    pub log_index: String,
    pub transaction_log_index: Option<String>,
    pub removed: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
enum EthereumRpcResponse {
    Success(EthereumRpcSuccessResponse),
    Error(EthereumRpcErrorResponse),
}

#[derive(Debug, Serialize, Deserialize)]
struct EthereumRpcSuccessResponse {
    pub jsonrpc: String,
    pub id: u64,
    pub result: Vec<EthereumLogEntry>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EthereumRpcErrorResponse {
    pub jsonrpc: String,
    pub id: u64,
    pub error: EthereumRpcError,
}

#[derive(Debug, Serialize, Deserialize)]
struct EthereumRpcError {
    pub code: i64,
    pub message: String,
}

///
pub struct EthereumClient {
    rpc_url: String,
    client: Client,
}

impl EthereumClient {
    ///
    pub fn new(rpc_url: &str) -> Result<EthereumClient> {
        Ok(EthereumClient {
            rpc_url: rpc_url.to_string(),
            client: Client::new(),
        })
    }

    /// TODO: replace &str by BlockNumber when it becomes available.
    pub async fn fetch_logs(
        &self,
        from_block: &str,
        to_block: &str,
        address: Address
    ) -> Result<Vec<EthereumLogEntry>> {

        // Need to split how the blocks are parsed...! As if it's too much,
        // we may have a JSON RPC error from the node... As there is no hard limit
        // on the from/to values.
        //
        // Must be done by chunks of 500/1000 blocks maximum for instance.
        // if to - from > 500 => iterate to get all logs.

        let payload = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_getLogs",
            "params": [
                {
                    "fromBlock": from_block,
                    "toBlock": to_block,
                    "address": address.to_string(),
                }
            ]
        });

        let http_rsp = self.client.post(&self.rpc_url)
            .json(&payload)
            .send()
            .await?;

        let rsp: EthereumRpcResponse = http_rsp.json().await?;

        match rsp {
            EthereumRpcResponse::Success(r) => Ok(r.result),
            EthereumRpcResponse::Error(e) => anyhow::bail!(
                "Eth RPC failed [{}]: {}",
                e.error.code,
                e.error.message),
        }
    }
}
