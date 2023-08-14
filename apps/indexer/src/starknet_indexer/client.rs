use anyhow::Result;
use starknet::{
    core::{types::*, types::FieldElement},
    providers::{
        jsonrpc::HttpTransport, AnyProvider, JsonRpcClient, Provider,
    },
    signers::{LocalWallet, SigningKey},
};
use url::Url;

use crate::bridge_request::BridgeRequest;

///
pub struct StarknetClient {
    rpc_url: String,
    provider: AnyProvider,
    wallet: Option<LocalWallet>,
}

impl From<EmittedEvent> for BridgeRequest {
    ///
    fn from(event: EmittedEvent) -> Self {
        BridgeRequest::default()
    }
}

impl StarknetClient {
    ///
    pub fn new(
        rpc_url: &str,
        private_key: &Option<String>
    ) -> Result<StarknetClient> {
        let rpc_url_str = rpc_url.to_string();
        let rpc_url = Url::parse(rpc_url)?;
        let provider = AnyProvider::JsonRpcHttp(
            JsonRpcClient::new(HttpTransport::new(rpc_url)));

        Ok(StarknetClient {
            rpc_url: rpc_url_str,
            provider,
            wallet: StarknetClient::wallet_from_private_key(&private_key),
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

    ///
    fn wallet_from_private_key(private_key: &Option<String>) -> Option<LocalWallet> {
        if let Some(pk) = private_key {
            let private_key = match FieldElement::from_hex_be(&pk) {
                Ok(p) => p,
                Err(e) => {
                    println!("Error importing private key: {:?}", e);
                    return None;
                }
            };

            let key = SigningKey::from_secret_scalar(private_key);
            return Some(LocalWallet::from_signing_key(key));
        } else {
            return None;
        }
    }

}
