# Starklane Indexer

Starklane indexer has the task to index all the events
related to requests sent on the bridge. Both on ethereum and starknet.

## Architecture

As you will see in the code, we need starknet and ethereum code.
Ethereum code is based on [ethers-rs](https://github.com/gakonst/ethers-rs) (as alloy is not fully featured yet).
Starknet code is based on [starknet-rs](https://github.com/xJonathanLEI/starknet-rs).

You'll find two modules for each chain specific interation.
The indexers are separated (for now) in three modules:

1. Client, in charge of doing requests to get/send data from/on chain.
2. Events, where the logic for decoding/manipulating event data is.
3. Indexer, the overall logic to fetch/process/save data.

The persistence database code is inside `storage`, where you will
find the `stores` traits to be implemented in order to expose
the storage capabilities to the indexers.

For now, only `MongoStore` is implemented.

## What is indexed

Each bridge contract on Starknet and Ethereum emits the same kind of event.
The most used:
* Deposit request initiated (on L1/L2).
* Withdraw request completed (on L1/L2).

As the two chains may be indexed at different speeds and to avoid race
associated to that, the request content is always emitted with all of
those events.

Having the request content, we can ensure that each indexer can insert
the request in the database if it does not exist. And at the same time,
each indexer is completely independant from the other to insert the
events.

So, when an event is seen on starknet or a log on ethereum, the following
occurs:

1. From the log/event, the indexer construct a `Request`, an `Event` and a list
of potentiel `CrossChainTx`. Those are entities to saved into the stores.

2. If a `Request` already exist with it's hash, the content is always the same,
so the `Request` is not twice in the DB.

3. The `Event` is always inserted, as both chains have different events.

4. The `CrossChainTx` transactions apply for `withdraw_auto` (only L2->L1), and `burn_auto` (L2 <-> L1).
Those transactions are here to be sent automatically by the indexer (if a private key is provided).
Once a transaction is sent, it is no longer pending and will not be re-executed, event if the indexer
has to restart fetching the blocks.

## Dev

Work in progress for contribution guidelines and generic setup.
You will need:
    * anvil (from [foundry](https://github.com/foundry-rs/foundry))
    * katana (from [dojo](https://github.com/dojoengine/dojo))
    * [make](https://www.gnu.org/software/make/)
    * docker (to quickly start a database for testing)

1. Clone the repo
2. `cd apps/indexer`
3. Start a demo mongo database using `docker-compose -f ./docker-compose up -d`
4. Use the makefile to start the dev nodes (for now you perhaps need to edit the Makefile to use your path for katana and anvi).
   `make local_setup_with_devnodes` => this will start the devnodes + setup the starklane contracts on each chain + send one deposit tokens in each chain.
5. Compile and run with `RUST_LOG=debug cargo run -- --config-file local.config --mongodb mongodb://localhost:27017/starklane`
