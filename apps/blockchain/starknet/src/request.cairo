///! Request to bridge tokens.

use serde::Serde;
use traits::{Into, TryInto};
use option::OptionTrait;
use array::{ArrayTrait, SpanTrait};
use starknet::{ContractAddress, EthAddress};
use poseidon::poseidon_hash_span;
use keccak::keccak_u256s_be_inputs;

use starklane::token::collection_manager::CollectionType;
use starklane::string::LongString;

// Byte 1 of the header.
const HEADER_V1: u256 = 0x01;

// Byte 2 of the header: config for the collection.
const COLLECTION_TYPE_MASK: u256 = 0xff00;
const ERC721_TYPE: u256 = 0x0100;
const ERC1155_TYPE: u256 = 0x0200;

// Byte 3 of the header: config for deposit.
const DEPOSIT_AUTO_BURN: u256 = 0x010000;

// Byte 4 of the header: config for withdraw.
const WITHDRAW_AUTO: u256 = 0x01000000;

#[derive(Copy, Serde, Drop)]
struct Request {
    // Header of the request with protocol information.
    header: felt252,
    // Unique hash of the request.
    hash: u256,

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

/// Returns true if the header contains the withdraw auto flag,
/// false otherwise.
///
/// # Arguments
///
/// * `header` - Header to verify.
fn can_use_withdraw_auto(header: felt252) -> bool {
    return (header.into() & WITHDRAW_AUTO) == WITHDRAW_AUTO;
}

/// Returns the collection type enum from the given header.
///
/// # Arguments
///
/// * `header` - Header from where to extract collection type.
fn collection_type_from_header(header: felt252) -> CollectionType {
    let ct: u256 = header.into() & COLLECTION_TYPE_MASK;

    if ct == ERC721_TYPE {
        return CollectionType::ERC721;
    }

    if ct == ERC1155_TYPE {
        return CollectionType::ERC1155;
    }

    panic_with_felt252('Invalid collection type')
}

/// Returns a formatted V1 header.
///
/// Header is a felt252 (31 bits).
/// Byte 0 is the version (0x1).
/// Byte 1 is the contract interface (0x1 = ERC721, 0x2 = ERC1155).
/// Byte 2 is the deposit config.
/// Byte 3 is the withdraw config.
///
/// # Arguments
///
/// * `ctype` - Collection type.
/// * `use_deposit_burn_auto` - Enables burn auto in the header.
/// * `use_withdraw_auto` - Enables withdraw auto in the header.
fn request_header_v1(
    ctype: CollectionType,
    use_deposit_burn_auto: bool,
    use_withdraw_auto: bool,
) -> felt252 {
    let mut header: u256 = HEADER_V1;

    if (ctype == CollectionType::ERC721) {
        header = header | ERC721_TYPE;
    } else if (ctype == CollectionType::ERC1155) {
        header = header | ERC1155_TYPE;
    } else {
        panic_with_felt252('Invalid collection type');
    }

    if (use_deposit_burn_auto) {
        header = header | DEPOSIT_AUTO_BURN;
    }

    if (use_withdraw_auto) {
        header = header | WITHDRAW_AUTO;
    }

    header.try_into().expect('Invalid header V1')
}

/// Returns a computed request hash.
///
/// # Arguments
///
/// * `salt` - Random salt.
/// * `collection` - Token collection contract address (L2).
/// * `to_l1_address` - New owner on Ethereum (L1).
/// * `token_ids` - List of token ids to be transferred.
fn compute_request_hash(
    salt: felt252,
    collection: ContractAddress,
    to_l1_address: EthAddress,
    token_ids: Span<u256>,
) -> u256 {
    let c_felt: felt252 = collection.into();
    let mut buf: Array<u256> = array![salt.into(), c_felt.into(), to_l1_address.address.into()];
    let mut i: usize = 1;

    loop {
        if i == token_ids.len() {
            break ();
        }

        buf.append(*token_ids[i]);
        i += 1;
    };

    let mut span = buf.span();
    // TODO: check to not clear the first byte and change the
    // hash to u256 instead.
    keccak_u256s_be_inputs(span)
}



// **** TESTS ****
/// We have to use a contract as the syscall is not supported directly in tests.
#[starknet::interface]
trait IContractRequest<T> {
    fn compute_request_hash_from_contract(
        self: @T,
        salt: felt252,
        collection: ContractAddress,
        to_l1_address: EthAddress,
        token_ids: Span<u256>,
    ) -> u256;
}

#[starknet::contract]
mod contract_req_test {
    use super::{compute_request_hash, IContractRequest};
    use array::{ArrayTrait, SpanTrait};
    use starknet::{ContractAddress, EthAddress};

    #[storage]
    struct Storage {

    }

    #[external(v0)]
    impl ContractTestImpl of IContractRequest<ContractState> {
        fn compute_request_hash_from_contract(
            self: @ContractState,
            salt: felt252,
            collection: ContractAddress,
            to_l1_address: EthAddress,
            token_ids: Span<u256>,
        ) -> u256 {
            compute_request_hash(salt, collection, to_l1_address, token_ids)
        }
    }
}

#[cfg(test)]
mod tests {
    use debug::PrintTrait;
    use serde::Serde;
    use array::{ArrayTrait, SpanTrait};
    use integer::{U8IntoFelt252, U32IntoFelt252, Felt252TryIntoU32};
    use traits::{Into, TryInto};
    use option::OptionTrait;
    use result::ResultTrait;
    use starknet::{ContractAddress, EthAddress};
    use super::{
        Request, WITHDRAW_AUTO, DEPOSIT_AUTO_BURN, ERC721_TYPE, ERC1155_TYPE,
        can_use_withdraw_auto, collection_type_from_header,
        request_header_v1, compute_request_hash,
        contract_req_test, IContractRequestDispatcher, IContractRequestDispatcherTrait,
    };

    use starklane::token::collection_manager::CollectionType;
    use starklane::string::{
        LongString, LongStringLenTrait,
        LongStringIndexView, Felt252IntoLongString, LongStringLen
    };

    use snforge_std::{declare, deploy, PreparedContract};

    #[test]
    fn can_use_withdraw_auto_test() {
        let h: felt252 = WITHDRAW_AUTO.try_into().unwrap();
        assert(can_use_withdraw_auto(h), 'Withdraw auto fail');
    }

    #[test]
    fn collection_type_from_header_test() {
        let h: felt252 = ERC721_TYPE.try_into().unwrap();
        assert(collection_type_from_header(h) == CollectionType::ERC721, 'Invalid ERC721 CT');

        let h: felt252 = ERC1155_TYPE.try_into().unwrap();
        assert(collection_type_from_header(h) == CollectionType::ERC1155, 'Invalid ERC1155 CT');
    }

    #[test]
    #[should_panic(expected: ('Invalid collection type', ))]
    fn collection_type_from_header_test_fail() {
        let h: felt252 = 0;
        assert(collection_type_from_header(h) == CollectionType::ERC721, 'Invalid ERC721 CT');
    }

    #[test]
    fn request_header_v1_test() {
        let h = request_header_v1(CollectionType::ERC721, false, false);
        assert(collection_type_from_header(h) == CollectionType::ERC721, 'Invalid ERC721 CT');
        assert(!can_use_withdraw_auto(h), 'Withdraw auto fail');

        let h_u: u256 = h.into();
        assert(h_u & 0xff == 0x01, 'Invalid v1 version');
    }

    #[test]
    fn compute_request_hash_test() {
        let salt = 0xaa;
        let collection = starknet::contract_address_const::<0x11>();
        let to_l1_address: EthAddress = 0x22.try_into().unwrap();
        let ids: Array<u256> = array![1, 2];

        let class_hash = declare('contract_req_test');
        let prepared = PreparedContract {
            class_hash: class_hash,
            constructor_calldata: @array![]
        };

        let contract_address = deploy(prepared).unwrap();
        let disp = IContractRequestDispatcher { contract_address };

        let hash = disp.compute_request_hash_from_contract(
            salt,
            collection,
            to_l1_address,
            ids.span()
        );

        hash.print();
    }

    /// Should deserialize from buffer.
    #[test]
    #[available_gas(2000000000)]
    fn deserialize() {
        let buf = array![
            0x1, // hdr
            0x1, // hash
            0x0, // hash
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
        assert(*buf[1] == 0x1, 'hash low');
        assert(*buf[2] == 0x0, 'hash high');
        assert(*buf[3] == 0xe0c, 'collection_l1');
        assert(*buf[4] == 0x123, 'collection_l2');
        assert(*buf[5] == 0xe00, 'owner_l1');
        assert(*buf[6] == 0x456, 'owner_l2');
        assert(*buf[7] == 1, 'name len');
        assert(*buf[8] == 'name', 'name content');
        assert(*buf[9] == 1, 'symbol len');
        assert(*buf[10] == 'symbol', 'symbol content');
        assert(*buf[11] == 1, 'base_uri len');
        assert(*buf[12] == 'base_uri', 'base_uri len');
        assert(*buf[13] == 1, 'ids len');
        assert(*buf[14] == 1, 'ids[0] low');
        assert(*buf[15] == 0, 'ids[0] high');
        assert(*buf[16] == 0, 'values len');
        assert(*buf[17] == 1, 'uris len');
        assert(*buf[18] == 1, 'uris[0] len');
        assert(*buf[19] == 'uri_1', 'uris[0] content');
        assert(*buf[20] == 0, 'new owner len');
    }
}
