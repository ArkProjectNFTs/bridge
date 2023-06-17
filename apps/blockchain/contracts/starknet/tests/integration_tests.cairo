use starklane::bridge;
use starknet::ContractAddress;
use starknet::contract_address_const;
use starknet::class_hash::ClassHash;
use debug::PrintTrait;
use array::ArrayTrait;

const NAME: felt252 = 111;
const SYMBOL: felt252 = 222;

// use starklane::erc20::ERC20;
// use starklane::erc20::IERC20Dispatcher;
// use starklane::erc20::IERC20DispatcherTrait;

use traits::Into;
use starklane::token::{TokenURI, ArrayIntoTokenURI};

#[test]
#[available_gas(2000000)]
fn test_deploy_contract() {


//     let addr: ContractAddress =
//         contract_address_const::<0x47a707C5D559CE163D1919b66AAdC2D00686f563>();
//     let erc20_class_hash: ClassHash =
//         starknet::class_hash_const::<0x19696a84e2368147f9d76b4b8424eac9a292b0fa4b29c3fce164adbcd9be04>();

//     let initial_l2_addr = bridge::Bridge::read_l2_address(addr);
//     assert(initial_l2_addr == contract_address_const::<0>(), 'Contract already deployed');

//     bridge::Bridge::deploy_new_contract(addr, erc20_class_hash, NAME, SYMBOL);
//     let l2_contract_address = bridge::Bridge::read_l2_address(addr);

//     l2_contract_address.print();
// // assert(l2_contract_address != contract_address_const::<0>(), 'test');
}
