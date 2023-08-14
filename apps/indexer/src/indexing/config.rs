///! Indexing configuration from file.

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
    pub address: String,
    pub fetch_interval: u64,
}

///
#[derive(Debug, Serialize, Deserialize)]
pub struct StarklaneIndexerConfig {
    pub ethereum: ChainConfig,
    pub starknet: ChainConfig,
}

impl StarklaneIndexerConfig {
    /// Loads the configuration from a JSON file.
    pub fn from_file(file_path: &str) -> Result<StarklaneIndexerConfig> {
        let mut file = File::open(file_path)
            .expect("Failed to open config file");

        let mut json = String::new();
        file.read_to_string(&mut json).expect("Failed to read the config file");

        let config: StarklaneIndexerConfig = serde_json::from_str(&json)
            .expect("Failed to parse config JSON");

        Ok(config)
    }
}
