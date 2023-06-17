///! Messaging protocol
///!
///! The protocol for messaging is based
///! on the native type of cairo: felt252.
///! Felts are 32 bytes long when serialized.
///!
///! A message is composed of the following:
///!
///! The first felt252 (always present), is a header
///! which is being decoded to understand which structure
///! the message payload has.
///!
///! In the current version, the header is then followed
///! by the payload (other felt252) which are a serialized
///! requests for token to be bridged.

use traits::{Into, TryInto};
use serde::Serde;
use integer::U256TryIntoFelt252;
use array::ArrayTrait;
use option::OptionTrait;

use starknet::{ContractAddress, ContractAddressIntoFelt252};

use starklane::token::{TokenURI};

/// Request for a token to be bridged.
#[derive(Drop)]
struct RequestTokenBridge {
    // Collection information.
    collection_l1_address: u256,
    collection_name: felt252,
    collection_symbol: felt252,
    // Owner information.
    owner_l1_address: u256,
    owner_l2_address: ContractAddress,
    // If the contract is ERC721 or ERC1155.
    contract_type: felt252,
    // Token info.
    token_id: u256,
    token_uri: TokenURI,
}

/// Serde implementation for RequestTokenBridge.
impl RequestTokenBridgeSerde of serde::Serde<RequestTokenBridge> {

    ///
    fn serialize(self: @RequestTokenBridge, ref output: Array<felt252>) {
        self.collection_l1_address.serialize(ref output);
        output.append(*self.collection_name);
        output.append(*self.collection_symbol);
        self.owner_l1_address.serialize(ref output);
        output.append((*self.owner_l2_address).into());
        output.append(*self.contract_type);
        self.token_id.serialize(ref output);
        self.token_uri.serialize(ref output);
    }

    ///
    fn deserialize(ref serialized: Span<felt252>) -> Option<RequestTokenBridge> {
        let collection_l1_address = serde::Serde::<u256>::deserialize(ref serialized)?;
        let collection_name = serde::Serde::<felt252>::deserialize(ref serialized)?;
        let collection_symbol = serde::Serde::<felt252>::deserialize(ref serialized)?;
        let owner_l1_address = serde::Serde::<u256>::deserialize(ref serialized)?;
        let owner_l2_address = serde::Serde::<ContractAddress>::deserialize(ref serialized)?;
        let contract_type = serde::Serde::<felt252>::deserialize(ref serialized)?;
        let token_id = serde::Serde::<u256>::deserialize(ref serialized)?;
        let token_uri = serde::Serde::<TokenURI>::deserialize(ref serialized)?;

        Option::Some(
            RequestTokenBridge {
		collection_l1_address,
                collection_name,
                collection_symbol,
                owner_l1_address,
                owner_l2_address,
                contract_type,
                token_id,
                token_uri,
            }
        )
    }
}

#[cfg(test)]
mod tests {
    use debug::PrintTrait;
    use serde::Serde;
    use array::SpanTrait;
    use array::ArrayTrait;
    use traits::Into;
    use option::OptionTrait;
    use super::{RequestTokenBridge, RequestTokenBridgeSerde};

    use starknet::contract_address_const;

    use starklane::token::{TokenURI, Felt252IntoTokenURI};

    /// Should serialize and deserialize a RequestTokenBridge.
    #[test]
    #[available_gas(2000000000)]
    fn serialize_deserialize() {
        let req = RequestTokenBridge {
            collection_l1_address: 0xec_u256,
            collection_name: 'everai duo',
            collection_symbol: 'DUO',
            owner_l1_address: 0xe1_u256,
            owner_l2_address: contract_address_const::<888>(),
            contract_type: 'ERC721',
            token_id: 7777_u256,
            token_uri: 'https:...'.into(),
        };

        let mut buf = ArrayTrait::<felt252>::new();
        req.serialize(ref buf);

        // 8 fields, but token_uri is 2 felt252 longs and
        // u256 are 2 felts long.
        assert(buf.len() == 12, 'serialized buf len');

        assert(*buf[2] == 'everai duo', 'c_name');
        assert(*buf[3] == 'DUO', 'c_symbol');
        assert(*buf[6] == 888, 'o_l2_addr');
        assert(*buf[7] == 'ERC721', 'contract_type');
        assert(*buf[10] == 1, 'token uri len');
        assert(*buf[11] == 'https:...', 'token uri content');

        let mut sp = buf.span();
        let req2 = serde::Serde::<RequestTokenBridge>::deserialize(ref sp).unwrap();
    }

}
