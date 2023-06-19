use starklane::bridge;

const NAME: felt252 = 111;
const SYMBOL: felt252 = 222;

// use starklane::erc20::ERC20;
// use starklane::erc20::IERC20Dispatcher;
// use starklane::erc20::IERC20DispatcherTrait;

use starklane::token::erc721::{ERC721Bridgeable, IERC721BridgeableDispatcher, IERC721BridgeableDispatcherTrait, TokenURI, ArrayIntoTokenURI,
deploy as deploy_erc721bridgeable};

// use starklane::token::erc721::erc721_bridgeable::tests::{deploy as deploy_erc721bridgeable};

use serde::Serde;
use array::{ArrayTrait, SpanTrait};
use zeroable::Zeroable;
use option::OptionTrait;
use core::result::ResultTrait;
use traits::{TryInto, Into};
use starknet::contract_address::Felt252TryIntoContractAddress;
use starknet::class_hash::Felt252TryIntoClassHash;
use starknet::{ContractAddress,ClassHash};


#[test]
#[available_gas(2000000)]
fn test_deploy_contract() {

    let u: TokenURI = 'http://...'.into();

    let bridge = starknet::contract_address_const::<77>();
    let collection_owner = starknet::contract_address_const::<88>();

    let collection_addr = deploy_erc721bridgeable('everai duo', 'DUO', bridge, collection_owner);

    let collection = IERC721BridgeableDispatcher { contract_address: collection_addr };

}
