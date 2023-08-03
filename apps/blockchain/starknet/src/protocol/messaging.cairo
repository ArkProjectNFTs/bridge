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
///! by the collection info, and then an array of token info.

use traits::{Into, TryInto};
use serde::Serde;
use integer::U256TryIntoFelt252;
use array::{ArrayTrait, SpanTrait};
use option::OptionTrait;

use starknet::{ContractAddress, ContractAddressIntoFelt252};

use starklane::token::erc721::{TokenInfo, TokenInfoSerde};
use starklane::string::LongString;

/// Request to bridge tokens.
///
/// In this implementation, a request to bridge
/// tokens is limited at only ONE collection.
/// However, several tokens may be bridged in the same request.
///
/// TODO(glihm): Check if we do need u256, or if felt252 is ok for all the fields.
///              Verify how front-end libs like starknet.js behaves and solidity!
#[derive(Copy, Serde, Drop)]
struct BridgeRequest {
    header: felt252,
    req_hash: felt252,
    // Collection information.
    collection_l1_address: felt252,
    collection_l2_address: ContractAddress,
    collection_name: LongString,
    collection_symbol: LongString,
    collection_contract_type: felt252,
    // Owner information.
    owner_l1_address: felt252,
    owner_l2_address: ContractAddress,
    // List of tokens to be bridged for this collection.
    tokens: Span<TokenInfo>,
}

#[cfg(test)]
mod tests {
    use debug::PrintTrait;
    use serde::Serde;
    use array::{ArrayTrait, SpanTrait};
    use traits::Into;
    use option::OptionTrait;
    use super::{BridgeRequest, BridgeRequestSerde};

    use starknet::contract_address_const;

    use starklane::token::erc721::TokenInfo;
    use starklane::string::LongString;

    /// Should deserialize from external array.
    #[test]
    #[available_gas(2000000000)]
    fn deserialize_from_external_buffer() {
        let mut buf = ArrayTrait::<felt252>::new();
        buf.append(0x00000000000000000000000000000000000000000000000000000000cafebeef);
        buf.append(0x00000000000000000000000000000000000000000000000000000000000000ee);
        buf.append(0x000000000000000000000000e7f1725e7734ce288f8367e1bb143e90bb3f0512);
        buf.append(0x0);
        buf.append(0x1);
        buf.append(0x006576657261692064756f000000000000000000000000000000000000000000);
        buf.append(0x1);
        buf.append(0x004556455244554f000000000000000000000000000000000000000000000000);
        buf.append(0x721);
        buf.append(0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266);
        buf.append(0x03ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0);
        buf.append(0x2);
        buf.append(0x1);
        buf.append(0x0);
        buf.append(0x1);
        buf.append(0x004e4f5f55524900000000000000000000000000000000000000000000000000);
        buf.append(0x2);
        buf.append(0x0);
        buf.append(0x1);
        buf.append(0x004e4f5f55524900000000000000000000000000000000000000000000000000);

        assert(buf.len() == 20, 'Buf len');
        let mut sp = buf.span();
        let req2 = Serde::<BridgeRequest>::deserialize(ref sp).unwrap();
    }

    /// Should serialize and deserialize a BridgeRequest.
    #[test]
    #[available_gas(2000000000)]
    fn serialize_deserialize() {
        let mut tokens = ArrayTrait::<TokenInfo>::new();
        tokens.append(TokenInfo { token_id: 1_u256, token_uri: 'https:...'.into(),  });

        let mut tokens_span = tokens.span();

        let req = BridgeRequest {
            header: 1,
            req_hash: 123,
            collection_l1_address: 0x1c,
            collection_l2_address: starknet::contract_address_const::<0x2c>(),
            collection_name: 'everai duo'.into(),
            collection_symbol: 'DUO'.into(),
            collection_contract_type: 'ERC721',
            owner_l1_address: 0xe1,
            owner_l2_address: contract_address_const::<888>(),
            tokens: tokens_span,
        };

        let mut buf = ArrayTrait::<felt252>::new();
        req.serialize(ref buf);

        assert(buf.len() == 16, 'serialized buf len');

        assert(*buf[0] == 1, 'header');
        assert(*buf[1] == 123, 'req hash');
        assert(*buf[2] == 0x1c, 'c_l1_addr');
        assert(*buf[3] == 0x2c, 'c_l2_addr');
        assert(*buf[4] == 1, 'c_name_len');
        assert(*buf[5] == 'everai duo', 'c_name_content');
        assert(*buf[6] == 1, 'c_symbol_len');
        assert(*buf[7] == 'DUO', 'c_symbol_content');
        assert(*buf[8] == 'ERC721', 'contract_type');
        assert(*buf[9] == 0xe1, 'o_l1_addr');
        assert(*buf[10] == 888, 'o_l2_addr');
        assert(*buf[11] == 1, 'tokens len');
        assert(*buf[12] == 1, 'token id low');
        assert(*buf[13] == 0, 'token id high');
        assert(*buf[14] == 1, 'token uri len');
        assert(*buf[15] == 'https:...', 'token uri content');

        let mut sp = buf.span();
        let req2 = Serde::<BridgeRequest>::deserialize(ref sp).unwrap();
    }
}
