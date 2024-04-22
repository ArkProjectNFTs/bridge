use anyhow::{anyhow, Result};
use clap::Parser;

use starklane_indexer::{
    price::moralis::MoralisPrice,
    storage::{
        extract_database_name,
        mongo::MongoStore,
        store::{EventStore, RequestStore},
    },
};

use refund::Refund;

const ENV_PREFIX: &str = "INDEXER";
const ENV_SEPARATOR: &str = "__"; // "_" can't be used since we have key with '_' in json

#[derive(Parser, Debug)]
#[clap(about = "Extract refund")]
struct Args {
    #[clap(long, help = "Mongo db connection string", env = format!("{}{}MONGODB_URI", ENV_PREFIX, ENV_SEPARATOR))]
    mongodb: String,

    #[clap(long, help = "Max amount to refund")]
    amount_max: u64,

    #[clap(long, help = "CSV output file")]
    output: String,

    #[clap(long, help = "Ceil amount (false by default)", default_value_t = false)]
    ceil: bool,
}

const STRK_ADDR_ETH: &str = "0xCa14007Eff0dB1f8135f4C25B34De49AB0d42766";
const STRK_ADDR_STRK: &str = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

async fn get_strk_price() -> Result<f64> {
    let price = MoralisPrice::new(None)
        .get_price(STRK_ADDR_ETH, None)
        .await?;
    match price.parse::<f64>() {
        Ok(p) => Ok(p),
        Err(e) => Err(anyhow!("Failed to parse STRK price: {:?}", e)),
    }
}

fn compute_amount_strk(amount_usd: f64, strk_price: f64, amount_max: f64, ceil: bool) -> f64 {
    let amount_usd = if amount_usd > amount_max {
        amount_max
    } else {
        amount_usd
    };

    let amount = amount_usd / strk_price;
    if ceil {
        amount.ceil()
    } else {
        amount
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();
    let strk_price = get_strk_price().await?;
    log::info!("STRK price: {}", strk_price);
    let args = Args::parse();
    let amount_max = args.amount_max;
    let output = args.output;

    let dbname = extract_database_name(&args.mongodb)
        .expect("Database name couldn't be extracted from the connection string");
    let mongo_store = MongoStore::new(&args.mongodb, dbname).await?;

    let mut wtr = csv::Writer::from_path(output)?;

    if let Ok(events) = mongo_store
        .events_by_label(
            starklane_indexer::storage::EventLabel::DepositInitiatedL1,
            true,
        )
        .await
    {
        for event in events {
            let req = mongo_store.req_by_hash(&event.req_hash).await?;
            if req.is_some() {
                let req = req.unwrap();
                let refund = if event.price.is_some() {
                    event.price.unwrap().usd_price
                } else {
                    "-1".to_owned()
                };
                if refund != "-1" {
                    let amount_usd = refund.parse::<f64>().unwrap();
                    let amount =
                        compute_amount_strk(amount_usd, strk_price, amount_max as f64, args.ceil);
                    let refund_info = Refund {
                        token_address: STRK_ADDR_STRK.to_owned(),
                        dest: req.to,
                        amount,
                        amount_usd,
                        tx_hash: event.tx_hash,
                    };
                    wtr.serialize(refund_info.clone())?;
                    log::debug!("{:?}", refund_info);
                }
            }
        }
    }
    wtr.flush()?;
    Ok(())
}
