// SPDX-License-Identifier: MIT

%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_nn
from starkware.cairo.common.uint256 import Uint256
from starkware.starknet.common.messages import send_message_to_l1

@storage_var
func balance() -> (res: felt) {
}

@storage_var
func origin_l1_contract_address() -> (res: felt) {
}

@storage_var
func l1_owner_address() -> (res: felt) {
}

@storage_var
func l2_owner_address() -> (res: felt) {
}

@storage_var
func l1_contract_address() -> (res: felt) {
}

@storage_var
func token_id() -> (res: felt) {
}

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    balance.write(0);
    return ();
}

@external
func increase_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    amount: felt
) {
    with_attr error_message("Amount must be positive. Got: {amount}.") {
        assert_nn(amount);
    }

    let (res) = balance.read();
    balance.write(res + amount);
    return ();
}

@external
func set_origin_l1_contract_address{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr
}(l1_contract_address_: felt) {
    origin_l1_contract_address.write(l1_contract_address_);
    return ();
}

@view
func get_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (res: felt) {
    let (res) = balance.read();
    return (res,);
}

@view
func get_l1_owner_address{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    res: felt
) {
    let (res) = l1_owner_address.read();
    return (res,);
}

@view
func get_l2_owner_address{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    res: felt
) {
    let (res) = l2_owner_address.read();
    return (res,);
}

@view
func get_l1_contract_address{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    res: felt
) {
    let (res) = l1_contract_address.read();
    return (res,);
}

@view
func get_token_id{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    res: felt
) {
    let (res) = token_id.read();
    return (res,);
}

@l1_handler
func deposit{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    from_address: felt,
    l1_owner_address_: felt,
    l2_owner_address_: felt,
    l1_contract_address_: felt,
    tokenId_: felt,
    amount_: felt,
) {
    // Make sure the message was sent by the intended L1 contract.
    let (res) = balance.read();
    let (origin_l1_contract_address_) = origin_l1_contract_address.read();
    assert from_address = origin_l1_contract_address_;
    l1_owner_address.write(l1_owner_address_);
    l2_owner_address.write(l2_owner_address_);
    l1_contract_address.write(l1_contract_address_);
    token_id.write(tokenId_);
    balance.write(res + amount_);
    return ();
}
