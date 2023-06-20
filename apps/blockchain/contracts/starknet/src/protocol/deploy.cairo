///! Deployment related code.
///!
///! Deployment is done using the deploy_syscall.

use starknet::{ContractAddress, ClassHash};
use array::{ArrayTrait, SpanTrait};

#[internal]
fn deploy_erc721_bridgeable(
    class_hash: ClassHash,
    salt: felt252,
    name: felt252,
    symbol: felt252,
) -> ContractAddress {
    let mut calldata = ArrayTrait::<felt252>::new();
    calldata.append(name);
    calldata.append(symbol);

    // Last argument false -> set the address of the contract using this function
    // as the contract's deployed address.
    match starknet::deploy_syscall(class_hash, salt, calldata.span(), false) {
        Result::Ok((addr, _)) => addr,
        // TODO: do we want an event emitted here?
        Result::Err(revert_reason) => panic(revert_reason)
    }
}
