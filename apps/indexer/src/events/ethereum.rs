///! When PR like https://github.com/alloy-rs/core/pull/51
///! will be merged, eth calls will be far better with more typing.
///!

use anyhow::Result;
use alloy_primitives::{Address};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json};

use crate::utils;

// Max block range used to fetch ethereum logs.
// If the value is too high, as there is no hard limit
// for `fromBlock` and `toBlock`, the RPC may return an error.
// Starklane logs are usually small (data < 50 bytes).
const BLOCKS_MAX_RANGE: u64 = 200;

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
enum EthereumRpcResponse<T> {
    Success(EthereumRpcSuccessResponse<T>),
    Error(EthereumRpcErrorResponse),
}

#[derive(Debug, Serialize, Deserialize)]
struct EthereumRpcSuccessResponse<T> {
    pub jsonrpc: String,
    pub id: u64,
    pub result: T,
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

    /// Fetches logs for the given block range.
    ///
    /// TODO: rework needed, with the current implementation, if there are too much
    /// logs in the block range, RAM maybe impacted.
    /// TODO: replace &str by BlockNumber when it becomes available from Alloy.
    pub async fn fetch_logs(
        &self,
        from_block: &str,
        to_block: &str,
        address: Address
    ) -> Result<Vec<EthereumLogEntry>> {

        let from_block: u64 = utils::u64_from_hex(from_block)
            .expect("from_block cannot be converted into u64");

        // If to_block is latest -> get block number to apply arithmetic
        // and ensure safe fetching of the logs.
        let to_block: u64 = if to_block == "latest" {
            self.get_last_block_number()
                .await
                .expect("Can't fetch ethereum block number")
        } else {
            utils::u64_from_hex(to_block)
                .expect("to_block cannot be converted into u64")
        };

        let mut from = from_block;
        let to = to_block;
        let mut diff = to - from;

        let mut logs: Vec<EthereumLogEntry> = vec![];

        loop {
            let range_logs = self.fetch_safe_range(
                from,
                from + BLOCKS_MAX_RANGE - 1,
                address
            ).await?;

            logs.extend(range_logs);

            if diff >= BLOCKS_MAX_RANGE {
                diff -= BLOCKS_MAX_RANGE;
                from += BLOCKS_MAX_RANGE;
            } else {
                break;
            }
        }

        Ok(logs)
    }

    /// Fetches logs ensuring that the range between from and to block is not too
    /// high which can cause RPC to fail.
    async fn fetch_safe_range(&self, from_block: u64, to_block: u64, address: Address) -> Result<Vec<EthereumLogEntry>> {

        assert!(to_block - from_block < BLOCKS_MAX_RANGE,
                "Ethereum fetching logs for too much blocks and may fail.");

        println!("Fetching logs {} {}", from_block, to_block);

        let payload = Self::json_payload_build(from_block, to_block, address);

        let http_rsp = self.client.post(&self.rpc_url)
            .json(&payload)
            .send()
            .await?;

        let rsp: EthereumRpcResponse<Vec<EthereumLogEntry>> = http_rsp.json().await?;

        match rsp {
            EthereumRpcResponse::Success(r) => Ok(r.result),
            EthereumRpcResponse::Error(e) => anyhow::bail!(
                "Eth RPC failed [{}]: {}",
                e.error.code,
                e.error.message),
        }
    }

    ///
    fn json_payload_build(from_block: u64, to_block: u64, address: Address) -> serde_json::Value{
        json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_getLogs",
            "params": [
                {
                    "fromBlock": format!("{:#x}", from_block),
                    "toBlock": format!("{:#x}", to_block),
                    "address": address.to_string(),
                }
            ]
        })
    }

    ///
    async fn get_last_block_number(&self) -> Result<u64> {
        let payload = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_blockNumber",
            "params": []
        });

        let http_rsp = self.client.post(&self.rpc_url)
            .json(&payload)
            .send()
            .await?;

        let rsp: EthereumRpcResponse<String> = http_rsp.json().await?;

        match rsp {
            EthereumRpcResponse::Success(r) => Ok(utils::u64_from_hex(&r.result)?),
            EthereumRpcResponse::Error(e) => anyhow::bail!(
                "Eth RPC failed [{}]: {}",
                e.error.code,
                e.error.message),
        }
    }
}
