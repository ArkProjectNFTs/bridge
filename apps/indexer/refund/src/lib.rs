use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Refund {
    #[serde(rename = "Token Address")]
    pub token_address: String,
    #[serde(rename = "Recipient")]
    pub dest: String,
    #[serde(rename = "Amount")]
    pub amount: f64,
    #[serde(rename = "USD")]
    pub amount_usd: f64,
    #[serde(rename = "Transaction Hash")]
    pub tx_hash: String,
}
