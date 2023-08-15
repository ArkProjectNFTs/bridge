use anyhow::Result;
use std::sync::Arc;
use starknet::{
    core::{types::*, types::FieldElement},
    accounts::{Account, Call, SingleOwnerAccount},
    providers::{
        jsonrpc::HttpTransport, AnyProvider, JsonRpcClient, Provider,
    },
    signers::{LocalWallet, SigningKey},
};
use url::Url;

use crate::storage::Request;

///
pub struct StarknetClient {
    rpc_url: String,
    chain_id: FieldElement,
    provider: AnyProvider,
    wallet: Option<LocalWallet>,
    account_address: Option<FieldElement>,
}

// impl From<EmittedEvent> for Request {
//     ///
//     fn from(event: EmittedEvent) -> Self {
//         Request::default()
//     }
// }

impl StarknetClient {
    ///
    pub async fn new(
        rpc_url: &str,
        account_address: &Option<String>,
        private_key: &Option<String>,
    ) -> Result<StarknetClient> {
        let rpc_url_str = rpc_url.to_string();
        let rpc_url = Url::parse(rpc_url)?;
        let provider = AnyProvider::JsonRpcHttp(
            JsonRpcClient::new(HttpTransport::new(rpc_url)));

        let wallet = StarknetClient::wallet_from_private_key(&private_key);
        let chain_id = provider.chain_id().await?;
        let account_address = if let Some(pk) = account_address {
            Some(FieldElement::from_hex_be(&pk)?)
        } else {
            None
        };

        Ok(StarknetClient {
            rpc_url: rpc_url_str,
            provider,
            wallet,
            account_address,
            chain_id,
        })
    }

    /// On Starknet, a chunk size limits the maximum number of events
    /// that can be retrieved with one call.
    /// To ensure all events are fetched, we must ensure all events pages
    /// are correctly fechted.
    pub async fn fetch_events(
        &self,
        from_block: BlockId,
        to_block: BlockId,
        address: FieldElement
    ) -> Result<Vec<EmittedEvent>> {

        let filter = EventFilter {
            from_block: Some(from_block),
            to_block: Some(to_block),
            address: Some(address),
            keys: None,
        };

        let mut events = vec![];

        let chunk_size = 100;
        let mut continuation_token: Option<String> = None;

        loop {
            let event_page = self.provider.get_events(
                filter.clone(),
                continuation_token,
                chunk_size)
                .await?;

            events.extend(event_page.events);
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
            let private_key = match FieldElement::from_hex_be(&pk) {
                Ok(p) => p,
                Err(e) => {
                    log::error!("Error importing private key: {:?}", e);
                    return None;
                }
            };
            let key = SigningKey::from_secret_scalar(private_key);
            return Some(LocalWallet::from_signing_key(key));
        } else {
            return None;
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
            None => anyhow::bail!("An account address is required to send transaction on starknet!"),
        };

        let mut account =
            SingleOwnerAccount::new(
                &self.provider,
                signer,
                account_address,
                self.chain_id
            );

        account.set_block_id(BlockId::Tag(BlockTag::Pending));

        let execution = account.execute(calls).fee_estimate_multiplier(1.5f64);
        let estimated_fee = (execution.estimate_fee().await?.overall_fee) * 3 / 2;
        let tx = execution.max_fee(estimated_fee.into()).send().await?;

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
