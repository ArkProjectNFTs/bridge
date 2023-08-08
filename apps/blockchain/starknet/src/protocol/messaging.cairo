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
#[derive(Copy, Serde, Drop)]
struct Request {
    header: felt252,
    hash: felt252,

    collection_l1: felt252,
    collection_l2: ContractAddress,

    owner_l1: felt252,
    owner_l2: ContractAddress,

    name: LongString,
    symbol: LongString,
    uri: LongString,

    token_ids: Span<u256>,
    token_values: Span<u256>,
    token_URIs: Span<LongString>,
}

#[cfg(test)]
mod tests {
    use debug::PrintTrait;
    use serde::Serde;
    use array::{ArrayTrait, SpanTrait};
    use traits::Into;
    use option::OptionTrait;
    use super::{Request, RequestSerde};

    use starknet::contract_address_const;

    use starklane::token::erc721::TokenInfo;
    use starklane::string::LongString;

    /// Should deserialize from external array.
    #[test]
    #[available_gas(2000000000)]
    fn deserialize_from_external_buffer() {
        let mut buf = ArrayTrait::<felt252>::new();
        data.append(0) = 0x1;
        data.append(1) = 0x1;
        data.append(2) = 0x0;
        data.append(3) = 0x123;
        data.append(4) = 0x0;
        data.append(5) = 0x789;
        data.append(6) = 0;
        data.append(7) = 0;
        data.append(8) = 1;
        data.append(9) = 0x0041424344000000000000000000000000000000000000000000000000000000;
        data.append(10) = 1;
        data.append(11) = 1;
        data.append(12) = 0;
        data.append(13) = 0;
        data.append(14) = 0;

        let mut sp = buf.span();
        let req = Serde::<Request>::deserialize(ref sp).unwrap();

        // TODO: Assert all fields and lengths.
        assert(req.header == 0x1, 'header');
        assert(req.hash == 0x1, 'hash');
        assert(req.collectionL1 == 0x0, 'collectionL1');
        assert(req.collectionL2 == 0x123, 'collectionL2');
        assert(req.ownerL1 == 0x0, 'ownerL1');
        assert(req.ownerL2 == 0x789, 'ownerL2');
        assert(req.name.content.len == 0);
        assert(req.name.content[0] == '');
        assert(req.symbol.content.len == 0);
        assert(req.symbol.content[0] == '');
        assert(req.uri.content.len == 1);
        assert(req.uri.content[0] == 'ABCD');
        assert(req.token_ids.length, 1);
        assert(req.token_ids[0], 1);
        assert(req.token_ids[1], 0);
        assert(req.token_values.length, 0);
        assert(req.token_URIs.length, 0);
    }

    /// Should serialize and deserialize a Request.
    #[test]
    #[available_gas(2000000000)]
    fn serialize() {
        let mut tokens_ids: Array<u256> = ArrayTrait::new();
        tokens_ids.append(1);

        let mut tokens_values: Array<u256> = ArrayTrait::new();
        let mut tokens_URIs: Array<LongString> = ArrayTrait::new();

        let mut tokens_span = tokens.span();

        let req = Request {
            header: 0x1,
            hash: 0x1,
            collectionL1: 0x0,
            collectionL2: 0x123,
            ownerL1: 0x0,
            ownerL2: 0x789,
            name: '',
            symbol: '',
            uri: 'ABCD',
            token_ids,
            token_values,
            token_URIs,
        };

        let mut buf = ArrayTrait::<felt252>::new();
        req.serialize(ref buf);

        assert(buf.length == 15, 'len');
        assert(*buf[0] = 0x1, 'header');
        assert(*buf[1] = 0x1, 'hash');
        assert(*buf[2] = 0x0, 'collectionL1');
        assert(*buf[3] = 0x123, 'collectionL2');
        assert(*buf[4] = 0x0, 'ownerL1');
        assert(*buf[5] = 0x789, 'ownerL2');
        assert(*buf[6] = 0, 'name');
        assert(*buf[7] = 0, 'symbol');
        assert(*buf[8] = 1, 'uri len');
        assert(*buf[9] = 0x0041424344000000000000000000000000000000000000000000000000000000, 'uri content');
        assert(*buf[10] = 1, 'ids len');
        assert(*buf[11] = 1, 'ids first low');
        assert(*buf[12] = 0, 'ids first high');
        assert(*buf[13] = 0, 'values');
        assert(*buf[14] = 0, 'URIs');
    }
}
