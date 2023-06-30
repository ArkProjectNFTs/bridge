///! Deployment related code.
///!
///! Deployment is done using the deploy_syscall.

use traits::Into;
use starknet::{ContractAddress, ClassHash};
use array::{ArrayTrait, SpanTrait};
use serde::Serde;
use starklane::string::{LongString, LongStringSerde};

#[internal]
fn deploy_erc721_bridgeable(
    class_hash: ClassHash,
    salt: felt252,
    name: LongString,
    symbol: LongString,
    bridge_address: ContractAddress,
) -> ContractAddress {
    let mut calldata = ArrayTrait::<felt252>::new();
    name.serialize(ref calldata);
    symbol.serialize(ref calldata);
    calldata.append(bridge_address.into());
    // For now, the bridge is by default the collection owner.
    calldata.append(bridge_address.into());

    // Last argument false -> set the address of the contract using this function
    // as the contract's deployed address.
    match starknet::deploy_syscall(class_hash, salt, calldata.span(), false) {
        Result::Ok((addr, _)) => addr,
        // TODO: do we want an event emitted here?
        Result::Err(revert_reason) => panic(revert_reason)
    }
}
