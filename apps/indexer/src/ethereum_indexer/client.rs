///! When PR like https://github.com/alloy-rs/core/pull/51
///! will be merged, eth calls will be far better with more typing.
///!
use anyhow::Result;
use ethers::prelude::*;
use ethers::providers::{Http, Provider};
use ethers::types::{Address, BlockNumber, Log};
use k256::ecdsa::SigningKey;
use std::str::FromStr;
use std::sync::Arc;

use crate::config::ChainConfig;

abigen!(
    StarklaneBridge,
    "./Starklane_ABI.json",
    event_derives(serde::Deserialize, serde::Serialize)
);

// Max block range used to fetch ethereum logs.
// If the value is too high, as there is no hard limit
// for `fromBlock` and `toBlock`, the RPC may return an error.
// Starklane logs are usually small (data < 50 bytes).
const BLOCKS_MAX_RANGE: u64 = 200;

///
pub struct EthereumClient {
    provider: Provider<Http>,
    provider_signer: Option<SignerMiddleware<Provider<Http>, Wallet<SigningKey>>>,
    bridge_address: Address,
}

impl EthereumClient {
    ///
    pub async fn new(config: ChainConfig) -> Result<EthereumClient> {
        let provider = Provider::<Http>::try_from(&config.rpc_url)?;

        let chain_id = provider.get_chainid().await.unwrap();

        let provider_signer = if let Some(pk) = &config.account_private_key {
            let wallet: LocalWallet = pk.parse::<LocalWallet>()?.with_chain_id(chain_id.as_u32());
            Some(SignerMiddleware::new(provider.clone(), wallet.clone()))
        } else {
            None
        };

        let bridge_address = Address::from_str(&config.bridge_address)?;

        Ok(EthereumClient {
            provider,
            provider_signer,
            bridge_address,
        })
    }

    ///
    pub fn get_bridge_caller(&self) -> StarklaneBridge<Provider<Http>> {
        StarklaneBridge::new(self.bridge_address.clone(), Arc::new(self.provider.clone()))
    }

    ///
    pub fn get_bridge_sender(
        &self,
    ) -> StarklaneBridge<SignerMiddleware<Provider<Http>, Wallet<SigningKey>>> {
        let signer = self.provider_signer
            .clone()
            .expect("Bridge sender requested but not initialized. Did you provide a private key in the config?");

        StarklaneBridge::new(self.bridge_address.clone(), Arc::new(signer))
    }

    ///
    pub async fn get_block_number(&self) -> u64 {
        self.provider
            .get_block_number()
            .await
            .expect("Can't fetch eth last block")
            .try_into()
            .expect("Not a valid u64 (to)")
    }

    /// Fetches logs for the given block options.
    ///
    /// There is not pagination in ethereum, and no hard limit on block range.
    /// To avoid too large requests and error from RPC, only safe range of blocks
    /// are fetched. We then iterate on those ranges to fullfill the inital range requested.
    ///
    /// Note: This version can be very RAM consuming, especially if the block range is very
    /// big.
    /// TODO: implement a `fetch_logs_safe` which is only fecthing a safe range limit,
    /// and return the last block fetched (Result<(Vec<Log>, u64)>) to let the caller
    /// iterate as it needs.
    pub async fn fetch_logs(&self, from_block: u64, to_block: u64) -> Result<Vec<Log>> {
        let mut from_block = from_block;
        let mut diff = to_block - from_block;

        let mut logs: Vec<Log> = vec![];

        let filters = Filter {
            block_option: FilterBlockOption::Range {
                from_block: Some(BlockNumber::Number(from_block.into())),
                to_block: Some(BlockNumber::Number(
                    (from_block + BLOCKS_MAX_RANGE - 1).into(),
                )),
            },
            address: Some(ValueOrArray::Value(self.bridge_address.clone())),
            topics: Default::default(),
        };

        loop {
            let range_logs = self.provider.get_logs(&filters).await?;
            logs.extend(range_logs);

            if diff >= BLOCKS_MAX_RANGE {
                diff -= BLOCKS_MAX_RANGE;
                from_block += BLOCKS_MAX_RANGE;
            } else {
                break;
            }
        }

        Ok(logs)
    }
}
