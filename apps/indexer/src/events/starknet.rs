use anyhow::Result;
use starknet::{
    macros::felt,
    core::{chain_id, types::*},
    providers::{
        jsonrpc::HttpTransport, AnyProvider, JsonRpcClient, Provider, ProviderError,
        SequencerGatewayProvider,
    },
};
use url::Url;

///
pub struct StarknetClient {
    rpc_url: String,
    provider: AnyProvider,
}

impl StarknetClient {
    ///
    pub fn new(rpc_url: &str) -> Result<StarknetClient> {
        let rpc_url_str = rpc_url.to_string();
        let rpc_url = Url::parse(rpc_url)?;
        let provider = AnyProvider::JsonRpcHttp(
            JsonRpcClient::new(HttpTransport::new(rpc_url)));

        Ok(StarknetClient {
            rpc_url: rpc_url_str,
            provider,
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

        let chunk_size = 500;
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

}
