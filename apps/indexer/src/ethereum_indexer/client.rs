///! When PR like https://github.com/alloy-rs/core/pull/51
///! will be merged, eth calls will be far better with more typing.
///!

use anyhow::Result;
use ethers::types::{Address, Log, BlockNumber};
use ethers::providers::{Provider, Http};
use ethers::prelude::*;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json};
use k256::ecdsa::SigningKey;
use std::str::FromStr;
use std::sync::Arc;

use crate::utils;

// Max block range used to fetch ethereum logs.
// If the value is too high, as there is no hard limit
// for `fromBlock` and `toBlock`, the RPC may return an error.
// Starklane logs are usually small (data < 50 bytes).
const BLOCKS_MAX_RANGE: u64 = 200;

///
pub struct EthereumClient {
    rpc_url: String,
    provider: Provider<Http>,
    provider_signer: Option<SignerMiddleware<Provider<Http>, Wallet<SigningKey>>>,
}

impl EthereumClient {
    ///
    pub async fn new(rpc_url: &str, private_key: &Option<String>) -> Result<EthereumClient> {

        let provider = Provider::<Http>::try_from(rpc_url)?;

        let chain_id = provider.get_chainid().await.unwrap();

        let provider_signer = if let Some(pk) = private_key {
            let wallet: LocalWallet = pk.parse::<LocalWallet>()?.with_chain_id(chain_id.as_u32());
            Some(SignerMiddleware::new(
                provider.clone(),
                wallet.clone()))
        } else {
            None
        };
            
        Ok(EthereumClient {
            rpc_url: rpc_url.to_string(),
            provider,
            provider_signer,
        })
    }

    /// Fetches logs for the given block options.
    ///
    /// There is not pagination in ethereum, and no hard limit on block range.
    /// To avoid too large requests and error from RPC, only safe range of blocks
    /// are fetched. We then iterate on those ranges to fullfill the inital range requested.
    ///
    /// TODO: rework needed, with the current implementation, if there are too much
    /// logs in the block range, RAM maybe impacted.
    pub async fn fetch_logs(
        &self,
        from_block: &str,
        to_block: &str,
        address: Address
    ) -> Result<Vec<Log>> {

        let mut from_u64: u64 = match BlockNumber::from_str(from_block).expect("Invalid block number (from)") {
            BlockNumber::Earliest => 0,
            BlockNumber::Number(x) => x.try_into().expect("Not a valid u64 (from)"),
            _ => anyhow::bail!("Invalid block number (from_block)"),
        };

        let to_u64: u64 = match BlockNumber::from_str(to_block).expect("Invalid block number (to)") {
            BlockNumber::Latest => self.provider.get_block_number()
                .await
                .expect("Can't fetch eth last block")
                .try_into().expect("Not a valid u64 (to)"),
            BlockNumber::Number(x) => x.0[0],
            _ => anyhow::bail!("Invalid block number (to_block)"),
        };

        let mut diff = to_u64 - from_u64;

        let mut logs: Vec<Log> = vec![];

        let filters = Filter {
            block_option: FilterBlockOption::Range {
                from_block: Some(BlockNumber::Number(from_u64.into())),
                to_block: Some(BlockNumber::Number((from_u64 + BLOCKS_MAX_RANGE - 1).into()))
            },
            address: Some(ValueOrArray::Value(address)),
            topics: Default::default(),
        };

        loop {
            let range_logs = self.provider.get_logs(&filters).await?;
            logs.extend(range_logs);

            if diff >= BLOCKS_MAX_RANGE {
                diff -= BLOCKS_MAX_RANGE;
                from_u64 += BLOCKS_MAX_RANGE;
            } else {
                break;
            }
        }

        Ok(logs)
    }

    ///
    pub async fn send_test(&self) -> Result<()> {

        abigen!(
            Erc721B,
            "./Erc721B_ABI.json",
            event_derives(serde::Deserialize, serde::Serialize)
        );

        let from = Address::from_str("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266").unwrap();
        let to = Address::from_str("0x70997970C51812dc3A010C7d01b50e0d17dc79C8").unwrap();

        let contract = Erc721B::new(
            Address::from_str("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9").unwrap(),
            Arc::new(self.provider_signer.clone().expect("Signer provider required to send tx")));

        let tx = contract.transfer_from(from, to, U256::from(6)).send().await?.await?;
        println!("Transaction Receipt: {}", serde_json::to_string(&tx)?);

        Ok(())
    }

}
