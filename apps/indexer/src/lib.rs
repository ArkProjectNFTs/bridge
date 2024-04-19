pub mod config;
pub mod ethereum_indexer;
pub mod handlers;
pub mod price;
pub mod starknet_indexer;
pub mod storage;
pub mod utils;

#[derive(Clone, Debug)]
pub struct ChainsBlocks {
    pub sn: u64,
    pub eth: u64,
}
