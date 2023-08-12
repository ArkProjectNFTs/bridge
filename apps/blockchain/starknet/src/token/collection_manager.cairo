use serde::Serde;
use traits::Into;
use array::{ArrayTrait, SpanTrait};
use result::ResultTrait;
use option::OptionTrait;
use starknet::{ContractAddress, ClassHash};
use starklane::string::{LongString, SpanFeltSerializedTryIntoLongString};

/// Returns a new URI after a call to
/// the contract expected to support ERC721 metadata.
///
/// This function will try both selectors: token_uri and tokenUri.
///
/// Also, this implementation supports several ways of implementing
/// a token URI:
/// 1. A simple felt
/// 2. An array of felts serialized (starting with the length)
///
/// * `collection_address` - Collection address of the collection.
/// * `token_id` - Token id.
fn token_uri_from_contract_call(
    collection_address: ContractAddress, token_id: u256, 
) -> Option<LongString> {
    // TODO: add the interface detection when the standard is out.

    let token_uri_selector = 0x0226ad7e84c1fe08eb4c525ed93cccadf9517670341304571e66f7c4f95cbe54;
    let tokenUri_selector = 0x0362dec5b8b67ab667ad08e83a2c3ba1db7fdb4ab8dc3a33c057c4fddec8d3de;

    let mut _calldata: Array<felt252> = array![];
    token_id.serialize(ref _calldata);

    let calldata = _calldata.span();

    // As we use syscall, the return value is a raw span of serialized data.
    match starknet::call_contract_syscall(
        collection_address,
        token_uri_selector,
        calldata,
    ) {
        Result::Ok(span) => SpanFeltSerializedTryIntoLongString::try_into(span),
        Result::Err(e) => {
            match starknet::call_contract_syscall(
                collection_address, tokenUri_selector, calldata, 
            ) {
                Result::Ok(span) => SpanFeltSerializedTryIntoLongString::try_into(span),
                Result::Err(e) => {
                    Option::None
                }
            }
        }
    }
}

/// Returns the address of a newly deployed an erc721 bridegable contract.
///
/// # Arguments
///
/// * `class_hash` - Class hash of the contract.
/// * `salt` - Salt to use on deploy to compute the address.
/// * `name` - Descriptive name of the collection.
/// * `symbol` - Abbreviated name of the collection.
/// * `bridge_address` - Address of the bridge contract.
fn deploy_erc721_bridgeable(
    class_hash: ClassHash,
    salt: felt252,
    name: LongString,
    symbol: LongString,
    bridge_address: ContractAddress,
) -> ContractAddress {
    let mut calldata: Array<felt252> = array![];
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

