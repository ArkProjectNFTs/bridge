///! Token info.
///!
///! A struct to wrap ERC721 token information
///! in one struct.
///!
///! Mostly done for serialization purposes.

use traits::{Into, TryInto};
use serde::Serde;
use integer::U256TryIntoFelt252;
use array::{ArrayTrait, SpanTrait};
use option::OptionTrait;

use starknet::{ContractAddress, SyscallResult};

use super::interfaces::IERC721BridgeableDispatcher;

use starklane::string;
use starklane::string::{LongString, SpanFeltTryIntoLongString, SpanFeltSerializedTryIntoLongString};

/// ERC721 token info.
#[derive(Copy, Serde, Drop)]
struct TokenInfo {
    token_id: u256,
    token_uri: LongString,
}

/// Returns a new URI after a call to
/// the collection contract.
///
/// This function will try both selectors: token_uri and tokenUri.
///
/// TODO:
/// None if it fails? Or do we want to Revert?!
///
/// * `collection_address` - Collection address of the collection.
/// * `token_id` - Token id.
fn token_uri_from_contract_call(
    collection_address: ContractAddress, token_id: u256, 
) -> Option<LongString> {
    // TODO: add the interface detection when the standard is out.

    let token_uri_selector = 0x0226ad7e84c1fe08eb4c525ed93cccadf9517670341304571e66f7c4f95cbe54;
    let tokenUri_selector = 0x0362dec5b8b67ab667ad08e83a2c3ba1db7fdb4ab8dc3a33c057c4fddec8d3de;

    let mut _calldata: Array<felt252> = ArrayTrait::new();
    token_id.serialize(ref _calldata);

    let calldata = _calldata.span();

    // As we use syscall, the return value is a raw span of serialized data.
    match starknet::call_contract_syscall(collection_address, token_uri_selector, calldata, ) {
        Result::Ok(span) => SpanFeltSerializedTryIntoLongString::try_into(span),
        Result::Err(e) => {
            match starknet::call_contract_syscall(
                collection_address, tokenUri_selector, calldata, 
            ) {
                Result::Ok(span) => SpanFeltSerializedTryIntoLongString::try_into(span),
                Result::Err(e) => {
                    Option::None(())
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use debug::PrintTrait;
    use serde::Serde;
    use array::{ArrayTrait, SpanTrait};
    use traits::Into;
    use option::OptionTrait;
    use super::{TokenInfo, TokenInfoSerde};

    use starknet::contract_address_const;

    use starklane::string::{LongString, Felt252IntoLongString};

    /// Should serialize and deserialize a RequestTokenBridge.
    #[test]
    #[available_gas(2000000000)]
    fn serialize_deserialize() {
        let info = TokenInfo { token_id: 7777_u256, token_uri: 'https:...'.into(),  };

        let mut buf = ArrayTrait::<felt252>::new();
        info.serialize(ref buf);

        // u256 are 2 felts long.
        // token_uri has is 2 felts in that case.
        assert(buf.len() == 4, 'serialized buf len');

        assert(*buf[2] == 1, 'token uri len');
        assert(*buf[3] == 'https:...', 'token uri content');

        let mut sp = buf.span();
        let info2 = Serde::<TokenInfo>::deserialize(ref sp).unwrap();
    }
}
