///! Request to bridge tokens.

use serde::Serde;
use traits::{Into, TryInto};
use option::OptionTrait;
use array::{ArrayTrait, SpanTrait};
use starknet::{ContractAddress, EthAddress};
use poseidon::poseidon_hash_span;
use keccak::{keccak_u256s_be_inputs, keccak_u256s_le_inputs};

use starklane::token::collection_manager::CollectionType;

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

#[derive(Serde, Drop)]
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
    name: ByteArray,
    // Collection symbol (ERC1155: not used).
    symbol: ByteArray,
    // Base URI for the collection.
    base_uri: ByteArray,

    // Tokens to be bridged.
    ids: Span<u256>,

    // Amounts for each token
    // ERC721: not used.
    // ERC1155: if empty, the amount is 1 for each token id, else length must match `ids`.
    values: Span<u256>,

    // URIs for each individual token
    // ERC721: must be empty if `base_uri` is provided, else length must match `ids`.
    // ERC1155: not used.
    uris: Span<ByteArray>,

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
fn compute_request_header_v1(
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

    // Don't add the length of the array because we use abi.encodePacked,
    // where arrays are encoded without length.

    let mut i: usize = 0;
    loop {
        if i == token_ids.len() {
            break ();
        }

        buf.append(*token_ids[i]);
        i += 1;
    };

    let mut span = buf.span();
    let hash = keccak_u256s_be_inputs(span);

    // Ensure keccak endianness compatibility.
    u256 {
        low: integer::u128_byte_reverse(hash.high),
        high: integer::u128_byte_reverse(hash.low)
    }
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

    #[abi(embed_v0)]
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
        compute_request_header_v1, compute_request_hash,
        contract_req_test, IContractRequestDispatcher, IContractRequestDispatcherTrait,
    };

    use starklane::token::collection_manager::CollectionType;

    use snforge_std::{declare, ContractClassTrait};

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
        let h = compute_request_header_v1(CollectionType::ERC721, false, false);
        assert(collection_type_from_header(h) == CollectionType::ERC721, 'Invalid ERC721 CT');
        assert(!can_use_withdraw_auto(h), 'Withdraw auto fail');

        let h_u: u256 = h.into();
        assert(h_u & 0xff == 0x01, 'Invalid v1 version');
    }

    #[test]
    fn compute_request_hash_test() {
        let salt = 123;
        let collection = starknet::contract_address_const::<0>();
        let to_l1_address: EthAddress = 1.try_into().unwrap();
        let ids: Array<u256> = array![88];

        let contract = declare("contract_req_test");

        let contract_address = contract.deploy(@array![]).unwrap();
        let disp = IContractRequestDispatcher { contract_address };

        let hash = disp.compute_request_hash_from_contract(
            salt,
            collection,
            to_l1_address,
            ids.span()
        );

        assert(hash == 0xbb7ca67ee263bd2bb68dc88b530300222a3700bceca4e537079047fff89a0402_u256,
               'Invalid req hash');
    }

    /// Should deserialize from buffer.
    #[test]
    fn deserialize() {
        let buf = array![
            0x1, // hdr
            0x1, // hash
            0x0, // hash
            0xe0c, // collection_l1
            0x123, // collection_l2
            0xe00, // owner_l1
            0x456, // owner_l2
            0, // name len
            'name', // name pending word
            4, // name pending word length
            0, // symbol len
            'symbol', // symbol pending word
            6, // symbol pending word length
            0, // base_uri len
            'base_uri', // base_uri pending word
            8, // base_uri pending word length
            1, // ids len
            1, // id[0] low
            0, // id[0] high
            0, // values len
            1, // uris len
            0, // uri[0] len
            'uri_1', // uri[0] pending word
            5, // uri[0] pending word len
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
        assert(req.name == "name", 'name');
        assert(req.symbol == "symbol", 'symbol');
        assert(req.base_uri == "base_uri", 'base_uri');
        assert(req.ids.len() == 1, 'ids len');
        assert(*req.ids[0] == 1_u256, 'ids 0');
        assert(req.values.len() == 0, 'values len');
        assert(req.uris.len() == 1, 'uris len');
        assert(req.uris[0].clone() == "uri_1", 'uris[0] content');
        assert(req.new_owners.len() == 0, 'new owners len');
    }

    /// Should serialize request into a buffer.
    #[test]
    fn serialize() {
        let ids: Span<u256> = array![1_u256].span();
        let values: Span<u256> = array![].span();
        let uris: Span<ByteArray> = array!["uri_1"].span();
        let new_owners: Span<ContractAddress> = array![].span();

        let req = Request {
            header: 0x1,
            hash: 0x1,
            collection_l1: 0xe0c.try_into().unwrap(),
            collection_l2: 0x123.try_into().unwrap(),
            owner_l1: 0xe00.try_into().unwrap(),
            owner_l2: 0x456.try_into().unwrap(),
            name: "name",
            symbol: "symbol",
            base_uri: "base_uri",
            ids,
            values,
            uris,
            new_owners,
        };

        let mut buf = array![];
        req.serialize(ref buf);
        assert_eq!(*buf[0], 0x1, "header");
        assert_eq!(*buf[1], 0x1, "hash low");
        assert_eq!(*buf[2], 0x0, "hash high");
        assert_eq!(*buf[3], 0xe0c, "collection_l1");
        assert_eq!(*buf[4], 0x123, "collection_l2");
        assert_eq!(*buf[5], 0xe00, "owner_l1");
        assert_eq!(*buf[6], 0x456, "owner_l2");
        assert_eq!(*buf[7], 0, "name data len");
        assert_eq!(*buf[8], 'name', "name pending word");
        assert_eq!(*buf[9], 4, "name pending word length");
        assert_eq!(*buf[10], 0, "symbol len");
        assert_eq!(*buf[11], 'symbol', "symbol pending word");
        assert_eq!(*buf[12], 6, "symbol pending word length");
        assert_eq!(*buf[13], 0, "base_uri pending word");
        assert_eq!(*buf[14], 'base_uri', "base_uri pending word");
        assert_eq!(*buf[15], 8, "base_uri pending word length");
        assert_eq!(*buf[16], 1, "ids len");
        assert_eq!(*buf[17], 1, "ids[0] low");
        assert_eq!(*buf[18], 0, "ids[0] high");
        assert_eq!(*buf[19], 0, "values len");
        assert_eq!(*buf[20], 1, "uris len");
        assert_eq!(*buf[21], 0, "uris[0] len");
        assert_eq!(*buf[22], 'uri_1', "uris[0] pending word");
        assert_eq!(*buf[23], 5, "uris[0] pending word length");
        assert_eq!(*buf[24], 0, "new owner len");
    }
}
