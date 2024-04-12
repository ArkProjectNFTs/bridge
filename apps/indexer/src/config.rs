use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Read;

///
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainConfig {
    pub rpc_url: String,
    pub from_block: String,
    pub to_block: Option<String>,
    pub bridge_address: String,
    pub fetch_interval: u64,
    pub messaging_address: Option<String>,
    pub messaging_timeout: Option<u64>,
    /// For auto withdraw
    pub account_address: Option<String>,
    pub account_private_key: Option<String>,
    #[serde(default = "cooling_down_default")]
    pub cooling_down: u64,
}

const fn cooling_down_default() -> u64 {
    20
}

///
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct XchainTxConfig {
    pub enabled: bool,
    pub sn_min_block: u64,
    pub eth_min_block: u64,
}

///
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StarklaneIndexerConfig {
    pub ethereum: ChainConfig,
    pub starknet: ChainConfig,
    pub xchain_txor: XchainTxConfig,
}

impl StarklaneIndexerConfig {
    /// Loads the configuration from a JSON file.
    pub fn from_file(file_path: &str) -> Result<StarklaneIndexerConfig> {
        let mut file = File::open(file_path).expect("Failed to open config file");

        let mut json = String::new();
        file.read_to_string(&mut json)
            .expect("Failed to read the config file");

        let config: StarklaneIndexerConfig =
            serde_json::from_str(&json).expect("Failed to parse config JSON");

        Ok(config)
    }
}
