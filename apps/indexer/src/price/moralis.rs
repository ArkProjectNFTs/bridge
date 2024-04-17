use std::env;

use reqwest::{
    self,
    header::{HeaderMap, HeaderValue, ACCEPT, CONTENT_TYPE},
};

use serde::Deserialize;

use anyhow::{anyhow, Result};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct APIResponse {
    usd_price_formatted: String,
}

pub struct MoralisPrice {
    client: reqwest::Client,
    headers: HeaderMap,
}

impl MoralisPrice {
    pub fn new(api_key: Option<&str>) -> MoralisPrice {
        let api_key = if api_key.is_none() {
            env::var("MORALIS_API_KEY").expect("MORALIS_API_KEY environment variable")
        } else {
            api_key.unwrap().to_owned()
        };
        let client = reqwest::Client::new();
        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
        headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
        headers.insert("X-API-KEY", HeaderValue::from_str(&api_key).unwrap());
        MoralisPrice { client, headers }
    }

    pub async fn get_price(&self, token: &str, block: Option<u64>) -> Result<String> {
        let base_url = "https://deep-index.moralis.io/api/v2.2/erc20";
        let url = if block.is_some() {
            let block = block.unwrap();
            format!("{base_url}/{token}/price?chain=eth&to_block={block}")
        } else {
            format!("{base_url}/{token}/price?chain=eth")
        };
        let response = self
            .client
            .get(url)
            .headers(self.headers.clone())
            .send()
            .await?;
        if response.status().is_success() {
            match response.json::<APIResponse>().await {
                Ok(parsed) => Ok(parsed.usd_price_formatted),
                Err(_) => Err(anyhow!("Failed to parse response")),
            }
        } else {
            Err(anyhow!("{:?}", response.error_for_status()))
        }
    }
}
