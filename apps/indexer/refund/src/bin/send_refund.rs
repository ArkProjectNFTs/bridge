use std::time::Duration;

use anyhow::{anyhow, Result};
use clap::Parser;

use mongodb::{bson::doc, options::ClientOptions, Client, Collection};
use refund::Refund;
use serde::{Deserialize, Serialize};
use starklane_indexer::{storage::extract_database_name, utils::normalize_hex};
use starknet::{
    accounts::{Account, Call, ConnectedAccount, ExecutionEncoding, SingleOwnerAccount},
    core::{
        types::{ExecutionResult, FieldElement, StarknetError},
        utils::get_selector_from_name,
    },
    providers::{jsonrpc::HttpTransport, JsonRpcClient, Provider, ProviderError, Url},
    signers::{LocalWallet, SigningKey},
};

#[derive(Debug, Serialize, Deserialize)]
struct RefundSend {
    pub l1_hash: String,
    pub l2_hash: String,
    pub refund: Refund,
}

struct MongoStore {
    refunded: Collection<RefundSend>,
}

impl MongoStore {
    pub async fn new(connection_string: &str, db_name: &str) -> Result<MongoStore> {
        let client_options = ClientOptions::parse(connection_string).await?;
        let client = Client::with_options(client_options)?;
        let db = client.database(db_name);
        let refunded = db.collection::<RefundSend>("refunded");

        Ok(MongoStore { refunded })
    }

    pub async fn add(&self, l2_hash: String, refund: &Refund) -> Result<()> {
        let doc = RefundSend {
            l1_hash: refund.tx_hash.clone(),
            l2_hash: normalize_hex(&l2_hash).unwrap(),
            refund: refund.clone(),
        };
        self.refunded.insert_one(doc, None).await?;
        Ok(())
    }

    pub async fn check(&self, l1_hash: String) -> Result<Option<RefundSend>> {
        match self
            .refunded
            .find_one(doc! { "l1_hash": l1_hash}, None)
            .await
        {
            Ok(r) => Ok(r),
            Err(e) => Err(anyhow!("Failed to query DB: {:?}", e)),
        }
    }
}

#[derive(Parser, Debug)]
#[clap(about = "Send refund")]
struct Args {
    #[clap(long, help = "Mongo db connection string", env = "REFUND_MONGODB_URI")]
    mongodb: String,

    #[clap(long, help = "CSV input file")]
    input: String,

    #[clap(long, help = "Starknet RPC", env = "STARKNET_RPC")]
    rpc: String,

    #[clap(
        long,
        help = "Starknet account address",
        env = "STARKNET_ACCOUNT_ADDRESS"
    )]
    address: String,

    #[clap(
        long,
        help = "Starknet account private key",
        env = "STARKNET_PRIVATE_KEY"
    )]
    private_key: String,
}

fn refund_to_call(refund: &Refund) -> Call {
    let selector = get_selector_from_name("transfer").unwrap();
    let token_address = FieldElement::from_hex_be(&refund.token_address).unwrap();
    let dest = FieldElement::from_hex_be(&refund.dest).unwrap();
    let token_decimals = 18;
    let decimals = 8;
    let amount = refund.amount * (10_u64.pow(decimals) as f64);
    let amount = (amount as u128) * (10_u64.pow(token_decimals - decimals) as u128);
    let amount = FieldElement::from(amount);
    Call {
        to: token_address,
        selector,
        calldata: vec![dest, amount, FieldElement::ZERO],
    }
}

// From starkli
pub async fn watch_tx<P>(
    provider: P,
    transaction_hash: FieldElement,
    poll_interval: Duration,
) -> Result<()>
where
    P: Provider,
{
    loop {
        match provider.get_transaction_receipt(transaction_hash).await {
            Ok(receipt) => match receipt.execution_result() {
                ExecutionResult::Succeeded => {
                    log::info!(
                        "Transaction {} confirmed",
                        format!("{:#064x}", transaction_hash)
                    );

                    return Ok(());
                }
                ExecutionResult::Reverted { reason } => {
                    return Err(anyhow::anyhow!("transaction reverted: {}", reason));
                }
            },
            Err(ProviderError::StarknetError(StarknetError::TransactionHashNotFound)) => {
                log::debug!("Transaction not confirmed yet...");
            }
            Err(err) => return Err(err.into()),
        }

        tokio::time::sleep(poll_interval).await;
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();
    let args = Args::parse();

    let input = args.input;
    let rpc = args.rpc;
    let address = args.address;
    let private_key = args.private_key;

    let dbname = extract_database_name(&args.mongodb)
        .expect("Database name couldn't be extracted from the connection string");

    let provider = JsonRpcClient::new(HttpTransport::new(Url::parse(&rpc).unwrap()));
    let signer = LocalWallet::from(SigningKey::from_secret_scalar(
        FieldElement::from_hex_be(&private_key).unwrap(),
    ));
    let address = FieldElement::from_hex_be(&address).unwrap();
    let chain_id = provider.chain_id().await?;

    let account =
        SingleOwnerAccount::new(provider, signer, address, chain_id, ExecutionEncoding::New);

    log::debug!("Account address: {:?}", account.address());
    let mut calls: Vec<Call> = vec![];
    let mut refunds: Vec<Refund> = vec![];

    let mongo = MongoStore::new(&args.mongodb, dbname).await?;

    let mut rdr = csv::Reader::from_path(input)?;
    for elem in rdr.deserialize() {
        let refund: Refund = elem?;
        if let Ok(Some(_check)) = mongo.check(refund.clone().tx_hash).await {
            log::debug!("Already send: {:?}", refund);
            continue;
        }
        log::debug!("To send: {:?}", refund);
        let call = refund_to_call(&refund);
        calls.push(call);
        refunds.push(refund);
    }

    if calls.is_empty() {
        log::info!("No refund to send");
        return Ok(());
    }

    let invoke = account.execute(calls).send().await.unwrap();
    let provider = account.provider();
    log::debug!("Wait for transaction: {:?}", invoke.transaction_hash);
    let result = watch_tx(
        provider,
        invoke.transaction_hash,
        Duration::from_millis(10000),
    )
    .await;
    match result {
        Ok(_) => {
            for refund in refunds {
                let l2_hash = format!("{:#064x}", invoke.transaction_hash);
                let l2_hash = normalize_hex(&l2_hash).unwrap();
                mongo.add(l2_hash, &refund).await?
            }
            Ok(())
        }
        Err(e) => Err(anyhow!("Transaction failed! {:?}", e)),
    }
}
