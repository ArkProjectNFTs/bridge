///! Integration tests.

use starklane::bridge::{IBridgeDispatcher, IBridgeDispatcherTrait};
use starklane::bridge;
use starklane::token::erc721::{ERC721Bridgeable, IERC721BridgeableDispatcher, IERC721BridgeableDispatcherTrait, TokenURI, TokenInfo, ArrayIntoTokenURI};
use starklane::token::erc721;
use starklane::protocol::BridgeRequest;

use debug::PrintTrait;
use serde::Serde;
use array::{ArrayTrait, SpanTrait};
use zeroable::Zeroable;
use option::OptionTrait;
use core::result::ResultTrait;
use traits::{TryInto, Into};
use starknet::contract_address::Felt252TryIntoContractAddress;
use starknet::class_hash::Felt252TryIntoClassHash;
use starknet::{ContractAddress,ClassHash};
use starknet::testing;




#[test]
#[should_panic()]
#[available_gas(20000000)]
fn test_bad_request_addresses() {
    let bridge_admin_addr = starknet::contract_address_const::<0x7>();
    let bridge_addr = bridge::tests::deploy(bridge_admin_addr);
    let bridge = IBridgeDispatcher { contract_address: bridge_addr };

    testing::set_contract_address(bridge_admin_addr);
    bridge.set_erc721_default_contract(ERC721Bridgeable::TEST_CLASS_HASH.try_into().unwrap());

    let mut tokens_to_bridge: Array<TokenInfo> = ArrayTrait::new();

    let req = BridgeRequest {
        header: 1,
        collection_l1_address: 0,
        collection_l2_address: starknet::contract_address_const::<1234>(),
        collection_name: 'everai duo',
        collection_symbol: 'DUO',
        collection_contract_type: 'ERC721',
        owner_l1_address: 0x9988,
        owner_l2_address: starknet::contract_address_const::<0x999>(),
        tokens: tokens_to_bridge.span()
    };

    bridge.on_l1_message(req);
}

// WARNING::::: OUT OF GAS WITH 2000000???? Need to optimize...
#[test]
#[available_gas(20000000)]
fn bridge_request_from_l1() {
    let bridge_admin_addr = starknet::contract_address_const::<0x7>();
    let bridge_addr = bridge::tests::deploy(bridge_admin_addr);
    let bridge = IBridgeDispatcher { contract_address: bridge_addr };

    // To set the erc721 default class we must be admin.
    testing::set_contract_address(bridge_admin_addr);
    bridge.set_erc721_default_contract(ERC721Bridgeable::TEST_CLASS_HASH.try_into().unwrap());

    let TOKEN_ID = 77;
    let TOKEN_URI = 'http://everai.xyz/77';
    let TOKEN_L2_OWNER = starknet::contract_address_const::<0x8899>();

    let mut tokens_to_bridge: Array<TokenInfo> = ArrayTrait::new();
    tokens_to_bridge.append(TokenInfo {
        token_id: TOKEN_ID,
        token_uri: TOKEN_URI.into(),
    });

    let req = BridgeRequest {
        header: 1,
        collection_l1_address: 0x11cc,
        // 0 as the first token of this collection is being bridged.
        collection_l2_address: starknet::contract_address_const::<0>(),
        collection_name: 'everai duo',
        collection_symbol: 'DUO',
        collection_contract_type: 'ERC721',
        owner_l1_address: 0x9988,
        owner_l2_address: TOKEN_L2_OWNER,
        tokens: tokens_to_bridge.span()
    };

    let collection_l2_address = bridge.on_l1_message(req);
    assert(!collection_l2_address.is_zero(), 'collection not deployed');

    let collection = IERC721BridgeableDispatcher { contract_address: collection_l2_address };
    // Ensure the token was permissioned_mint.

    let token_owner = collection.owner_of(TOKEN_ID);
    assert(token_owner == TOKEN_L2_OWNER, 'Bad owner after mint');

    let token_uri = collection.token_uri(TOKEN_ID);
    assert(token_uri.len == 1, 'Bad token uri len');
    assert(*token_uri.content[0] == TOKEN_URI, 'Bad token uri content');


    // Now the collection is already deployed, new request for the same collection, new token to be
    // mint.
    let NEW_TOKEN_ID = 88;
    let NEW_TOKEN_URI = 'http://everai.xyz/88';

    let mut tokens_to_bridge_new: Array<TokenInfo> = ArrayTrait::new();
    tokens_to_bridge_new.append(TokenInfo {
        token_id: NEW_TOKEN_ID,
        token_uri: NEW_TOKEN_URI.into(),
    });

    let req_new = BridgeRequest {
        header: 1,
        collection_l1_address: 0x11cc,
        collection_l2_address: collection_l2_address,
        collection_name: 'everai duo',
        collection_symbol: 'DUO',
        collection_contract_type: 'ERC721',
        owner_l1_address: 0x9988,
        owner_l2_address: TOKEN_L2_OWNER,
        tokens: tokens_to_bridge_new.span()
    };

    let collection_l2_address_new = bridge.on_l1_message(req_new);
    assert(collection_l2_address_new == collection_l2_address, 'collection bad address');

    assert(collection.owner_of(TOKEN_ID) == TOKEN_L2_OWNER, 'Bad owner after mint');
    assert(collection.owner_of(NEW_TOKEN_ID) == TOKEN_L2_OWNER, 'Bad owner after mint');

    let token_uri_new = collection.token_uri(NEW_TOKEN_ID);
    assert(token_uri_new.len == 1, 'Bad token uri len');
    assert(*token_uri_new.content[0] == NEW_TOKEN_URI, 'Bad token uri content');


    // Now, we need to do a setup to test escrow scenario, which comes after sending request to L1.
}

#[test]
#[available_gas(20000000)]
fn deposit_token_from_l2() {
    let bridge_admin_addr = starknet::contract_address_const::<0x7>();
    let bridge_addr = bridge::tests::deploy(bridge_admin_addr);
    let bridge = IBridgeDispatcher { contract_address: bridge_addr };

    // To set the erc721 default class we must be admin.
    testing::set_contract_address(bridge_admin_addr);
    bridge.set_erc721_default_contract(ERC721Bridgeable::TEST_CLASS_HASH.try_into().unwrap());

    // Simulate a collection (which can be something else than ERC721Bridgeable).
    // But in this example we reuse the ERC721Bridgeable.
    let DUO_OWNER_L1 = 112288;
    let DUO_OWNER_L2 = starknet::contract_address_const::<128>();
    let TOKEN_ID = 887;

    let collection_l2_addr = erc721::deploy('everai duo', 'DUO', bridge_addr, bridge_addr);
    let collection = IERC721BridgeableDispatcher { contract_address: collection_l2_addr };
    collection.simple_mint(DUO_OWNER_L2, TOKEN_ID, 'uri'.into());

    let mut tokens: Array<u256> = ArrayTrait::new();
    tokens.append(TOKEN_ID);
    
    // Simulate we are the duo owner.
    testing::set_contract_address(DUO_OWNER_L2);
    
    // Approval is required to allow deposit token.
    collection.set_approval_for_all(bridge_addr, true);

    // Now we can deposit.
    bridge.deposit_tokens(collection_l2_addr, DUO_OWNER_L1, tokens.span());

    assert(bridge.is_token_escrowed(collection_l2_addr, TOKEN_ID), 'escrowed expected');
}
