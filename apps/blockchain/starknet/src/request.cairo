///! Request to bridge tokens.

use serde::Serde;
use array::{ArrayTrait, SpanTrait};
use starknet::{ContractAddress, EthAddress};

use starklane::string::LongString;

#[derive(Copy, Serde, Drop)]
struct Request {
    // Header of the request with protocol information.
    header: felt252,
    // Unique hash of the request.
    hash: felt252,

    // Address of the collection on Ethereum.
    collection_l1: EthAddress, 
    // Address of the collection on Starknet.
    collection_l2: ContractAddress,

    // Owner on Ethereum (for all the tokens in the request).
    owner_l1: EthAddress,
    // Owners on Starknet (for all the tokens in the request).
    owner_l2: ContractAddress,

    // Collection name (ERC1155: not used).
    name: LongString,
    // Collection symbol (ERC1155: not used).
    symbol: LongString,
    // Base URI for the collection.
    base_uri: LongString,

    // Tokens to be bridged.
    ids: Span<u256>,

    // Amounts for each token
    // ERC721: not used.
    // ERC1155: if empty, the amount is 1 for each token id, else length must match `ids`.
    values: Span<u256>,

    // URIs for each individual token 
    // ERC721: must be empty if `base_uri` is provided, else length must match `ids`.
    // ERC1155: not used.
    uris: Span<LongString>,

    // New owners on starknet. This allows a batch migration of the tokens to
    // different owners.
    // Must be empty if `owner_l2` is not 0. Otherwise, length must match `ids`.
    new_owners: Span<ContractAddress>,
}

#[cfg(test)]
mod tests {
    use debug::PrintTrait;
    use serde::Serde;
    use array::{ArrayTrait, SpanTrait};
    use integer::{U8IntoFelt252, U32IntoFelt252, Felt252TryIntoU32};
    use traits::{Into, TryInto};
    use option::OptionTrait;
    use starknet::{ContractAddress, EthAddress};
    use super::{Request};

    use starklane::string::{LongString, LongStringLenTrait,
                            LongStringIndexView, Felt252IntoLongString, LongStringLen};

    /// Should deserialize from buffer.
    #[test]
    #[available_gas(2000000000)]
    fn deserialize() {
        let buf = array![
            0x1, // hdr
            0x1, // hash
            0xe0c, // collection_l1
            0x123, // collection_l2
            0xe00, // owner_l1
            0x456, // owner_l2
            0x1, // name len
            'name', // name
            0x1, // symbol len
            'symbol', // symbol
            0x1, // base_uri len
            'base_uri', // base_uri
            1, // ids len
            1, // id[0] low
            0, // id[0] high
            0, // values len
            1, // uris len
            1, // uri[0] len
            'uri_1', // uri[0] val
            0, // new_owners len
        ];

        let mut sp = buf.span();
        let req = Serde::<Request>::deserialize(ref sp).unwrap();

        assert(req.header == 0x1, 'header');
        assert(req.hash == 0x1, 'hash');
        assert(req.collection_l1 == 0xe0c.try_into().unwrap(), 'collectionL1');
        assert(req.collection_l2 == 0x123.try_into().unwrap(), 'collectionL2');
        assert(req.owner_l1 == 0xe00.try_into().unwrap(), 'ownerL1');
        assert(req.owner_l2 == 0x456.try_into().unwrap(), 'ownerL2');
        assert(req.name == 'name'.into(), 'name');
        assert(req.symbol == 'symbol'.into(), 'symbol');
        assert(req.base_uri == 'base_uri'.into(), 'base_uri');
        assert(req.ids.len() == 1, 'ids len');
        assert(*req.ids[0] == 1_u256, 'ids 0');
        assert(req.values.len() == 0, 'values len');
        assert(req.uris.len() == 1, 'uris len');
        assert((*req.uris[0]).len() == 1, 'uris[0] len');
        assert(*req.uris[0] == 'uri_1'.into(), 'uris[0] content');
        assert(req.new_owners.len() == 0, 'new owners len');
    }

    /// Should serialize request into a buffer.
    #[test]
    #[available_gas(2000000000)]
    fn serialize() {
        let ids: Span<u256> = array![1_u256].span();
        let values: Span<u256> = array![].span();
        let uris: Span<LongString> = array!['uri_1'.into()].span();
        let new_owners: Span<ContractAddress> = array![].span();

        let req = Request {
            header: 0x1,
            hash: 0x1,
            collection_l1: 0xe0c.try_into().unwrap(),
            collection_l2: 0x123.try_into().unwrap(),
            owner_l1: 0xe00.try_into().unwrap(),
            owner_l2: 0x456.try_into().unwrap(),
            name: 'name'.into(),
            symbol: 'symbol'.into(),
            base_uri: 'base_uri'.into(),
            ids,
            values,
            uris,
            new_owners,
        };

        let mut buf = array![];
        req.serialize(ref buf);

        assert(*buf[0] == 0x1, 'header');
        assert(*buf[1] == 0x1, 'hash');
        assert(*buf[2] == 0xe0c, 'collection_l1');
        assert(*buf[3] == 0x123, 'collection_l2');
        assert(*buf[4] == 0xe00, 'owner_l1');
        assert(*buf[5] == 0x456, 'owner_l2');
        assert(*buf[6] == 1, 'name len');
        assert(*buf[7] == 'name', 'name content');
        assert(*buf[8] == 1, 'symbol len');
        assert(*buf[9] == 'symbol', 'symbol content');
        assert(*buf[10] == 1, 'base_uri len');
        assert(*buf[11] == 'base_uri', 'base_uri len');
        assert(*buf[12] == 1, 'ids len');
        assert(*buf[13] == 1, 'ids[0] low');
        assert(*buf[14] == 0, 'ids[0] high');
        assert(*buf[15] == 0, 'values len');
        assert(*buf[16] == 1, 'uris len');
        assert(*buf[17] == 1, 'uris[0] len');
        assert(*buf[18] == 'uri_1', 'uris[0] content');
        assert(*buf[19] == 0, 'new owner len');
    }
}
