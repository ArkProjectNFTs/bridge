use anyhow::Result;
use alloy_primitives::{Address};
use reqwest::{Client};
use serde::Deserialize;
use serde_json::{json};

/// Eth_getLogs call RPC call result.
/// https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs
/// https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EthereumLogEntry {
    _address: String,
    topics: Vec<String>,
    data: String,
    _block_hash: String,
    block_number: String,
    _transaction_hash: String,
    _transaction_index: String,
    _log_index: String,
    _transaction_log_index: Option<String>,
    _removed: bool,
}

#[derive(Debug, Deserialize)]
struct EthereumRpcLogsResponse {
    jsonrpc: String,
    id: u64,
    result: Vec<EthereumLogEntry>
}

pub async fn fetch_logs(from_block: u64, to_block: u64, address: Address) -> Result<()> {
    let payload = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_getLogs",
        "params": [
            {
                "fromBlock": "earliest",
                "toBlock": "latest",
                "address": address.to_string(),
            }
        ]
    });

    let client = Client::new();
    let res = client.post("https://goerli.infura.io/v3/d8088a2c561f4641bcc0f788e631804b")
        .json(&payload)
        .send()
        .await?;
    println!("RSP: {:?}", res);

    // let text = res.text().await?;

    // println!("JSON: {:?}", text);

    let rr: EthereumRpcLogsResponse = res.json().await?;
    println!("JSON: {:?}", rr);

    Ok(())
}
