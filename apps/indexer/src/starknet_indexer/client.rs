use crate::config::ChainConfig;
use anyhow::{anyhow, Result};
use regex::Regex;
use starknet::{
    accounts::{Account, Call, SingleOwnerAccount},
    core::{types::FieldElement, types::*},
    providers::{jsonrpc::HttpTransport, AnyProvider, JsonRpcClient, Provider},
    signers::{LocalWallet, SigningKey},
};
use std::collections::HashMap;
use std::sync::Arc;
use url::Url;

///
pub struct StarknetClient {
    chain_id: FieldElement,
    provider: AnyProvider,
    wallet: Option<LocalWallet>,
    account_address: Option<FieldElement>,
    bridge_address: FieldElement,
}

impl StarknetClient {
    ///
    pub async fn new(config: ChainConfig) -> Result<StarknetClient> {
        let rpc_url = Url::parse(&config.rpc_url)?;
        let provider = AnyProvider::JsonRpcHttp(JsonRpcClient::new(HttpTransport::new(rpc_url)));

        let wallet = StarknetClient::wallet_from_private_key(&config.account_private_key);
        let chain_id = provider.chain_id().await?;
        let account_address = if let Some(ac) = &config.account_address {
            Some(FieldElement::from_hex_be(ac)?)
        } else {
            None
        };

        let bridge_address = FieldElement::from_hex_be(&config.bridge_address)?;

        Ok(StarknetClient {
            provider,
            wallet,
            account_address,
            chain_id,
            bridge_address,
        })
    }

    ///
    pub async fn block_id_to_u64(&self, id: &BlockId) -> Result<u64> {
        match id {
            BlockId::Tag(BlockTag::Latest) => Ok(self.provider.block_number().await?),
            BlockId::Number(n) => Ok(*n),
            _ => Err(anyhow!("BlockID can´t be converted to u64")),
        }
    }

    ///
    pub fn parse_block_id(&self, id: &str) -> Result<BlockId> {
        let regex_block_number = Regex::new("^[0-9]{1,}$").unwrap();

        if id == "latest" {
            Ok(BlockId::Tag(BlockTag::Latest))
        } else if id == "pending" {
            Ok(BlockId::Tag(BlockTag::Pending))
        } else if regex_block_number.is_match(id) {
            Ok(BlockId::Number(id.parse::<u64>()?))
        } else {
            Ok(BlockId::Hash(FieldElement::from_hex_be(id)?))
        }
    }

    /// On Starknet, a chunk size limits the maximum number of events
    /// that can be retrieved with one call.
    /// To ensure all events are fetched, we must ensure all events pages
    /// are correctly fechted.
    ///
    /// TODO: for now this version is ok, but it can be RAM consuming
    /// as the events are accumulated before this function returns.
    /// We can think of an other version that returns each page, and let
    /// the caller process the pages.
    ///
    /// TODO: change return type to HashMap instead of vector, to have the block
    /// number as a key.
    pub async fn fetch_events(
        &self,
        from_block: BlockId,
        to_block: BlockId,
    ) -> Result<HashMap<u64, Vec<EmittedEvent>>> {
        log::info!("Starknet fetching blocks {:?} - {:?}", from_block, to_block);

        let mut events: HashMap<u64, Vec<EmittedEvent>> = HashMap::new();

        let filter = EventFilter {
            from_block: Some(from_block),
            to_block: Some(to_block),
            address: Some(self.bridge_address),
            keys: None,
        };

        let chunk_size = 200;
        let mut continuation_token: Option<String> = None;

        loop {
            let event_page = self
                .provider
                .get_events(filter.clone(), continuation_token, chunk_size)
                .await?;

            event_page.events.iter().for_each(|e| {
                events
                    .entry(e.block_number)
                    .and_modify(|v| v.push(e.clone()))
                    .or_insert(vec![e.clone()]);
            });

            continuation_token = event_page.continuation_token;

            if continuation_token.is_none() {
                break;
            }
        }

        Ok(events)
    }

    /// Returns a local wallet from a private key, if provided.
    fn wallet_from_private_key(private_key: &Option<String>) -> Option<LocalWallet> {
        if let Some(pk) = private_key {
            let private_key = match FieldElement::from_hex_be(pk) {
                Ok(p) => p,
                Err(e) => {
                    log::error!("Error importing private key: {:?}", e);
                    return None;
                }
            };
            let key = SigningKey::from_secret_scalar(private_key);
            Some(LocalWallet::from_signing_key(key))
        } else {
            None
        }
    }

    ///
    pub async fn invoke_tx(&self, calls: Vec<Call>) -> Result<()> {
        let signer = match &self.wallet {
            Some(w) => Arc::new(w),
            None => anyhow::bail!("A private key is required to send transaction on starknet!"),
        };

        let account_address = match self.account_address {
            Some(a) => a,
            None => {
                anyhow::bail!("An account address is required to send transaction on starknet!")
            }
        };

        let mut account =
            SingleOwnerAccount::new(&self.provider, signer, account_address, self.chain_id);

        account.set_block_id(BlockId::Tag(BlockTag::Pending));

        let execution = account.execute(calls).fee_estimate_multiplier(1.5f64);
        let estimated_fee = (execution.estimate_fee().await?.overall_fee) * 3 / 2;
        let _tx = execution.max_fee(estimated_fee.into()).send().await?;

        //println!("InvokeTX: {:?}", tx);

        Ok(())
    }

    /* Example of a call with invoke:
       let call = Call {
           to: felt!("0x006e31821066d2146a8efd816e915245db7624379ca5f3d179dddd0d3e09d647"),
           selector: felt!("0x03552df12bdc6089cf963c40c4cf56fbfd4bd14680c244d1c5494c2790f1ea5c"),
           calldata: vec![felt!("1"), felt!("0")],
       };
       self.client.invoke_tx(vec![call]).await;

    */
}
