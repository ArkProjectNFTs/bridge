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
    l1_contract_address: felt,
    to: felt,
    token_id: felt,
    name: felt,
    symbol: felt,
    token_uri: felt,
) {
    depositToken(l1_contract_address, name, symbol, to, token_uri, token_id);
    return ();
}

func depositToken{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    l1_contract_address: felt, name: felt, symbol: felt, to: felt, token_uri: felt, token_id: felt
) {
    alloc_locals;

    let uint_token_id = Uint256(token_id.high, token_id.low);
    let (contract_address) = _l1_to_l2_addresses.read(l1_contract_address);
    if (contract_address == 0) {
        let (deployed_contract_address) = deploy_new_contract(l1_contract_address, name, symbol);
        mintToken(deployed_contract_address, to, token_id);
    } else {
        mintToken(contract_address, to, token_id);
    }
    return ();
}

func mintToken{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    deployed_contract_address: felt, to: felt, token_id: Uint256
) -> (deployed_contract_address: felt) {
    alloc_locals;
    let (data: felt*) = alloc();

    IDefaultToken.permissionedMint(
        contract_address=deployed_contract_address,
        to=to,
        tokenId=token_id,
        data_len=0,
        data=data,
        tokenURI=0,
    );

    return (deployed_contract_address=deployed_contract_address);
}

func deploy_new_contract{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    l1_contract_address: felt, name: felt, symbol: felt
) -> (contract_address: felt) {
    alloc_locals;

    let (bridge_contract_address) = get_contract_address();
    let (message_payload: felt*) = alloc();

    assert message_payload[0] = bridge_contract_address;
    assert message_payload[1] = name;
    assert message_payload[2] = symbol;

    let (token_class_hash) = _token_class_hash.read();
    let (udc_contract_address) = _udc_contract.read();
    let (salt) = _contract_salt.read();
    let new_salt = salt + 1;

    let (deployed_contract_address) = IUniversalDeployerContract.deployContract(
        contract_address=udc_contract_address,
        classHash=token_class_hash,
        salt=new_salt,
        unique=0,
        calldata_len=3,
        calldata=message_payload,
    );

    _contract_salt.write(new_salt);
    _l1_to_l2_addresses.write(l1_contract_address, deployed_contract_address);

    collection_created.emit(address=deployed_contract_address);
    return (contract_address=deployed_contract_address);
}

@external
func set_salt{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(salt: felt) {
    Ownable.assert_only_owner();
    _contract_salt.write(salt);
    return ();
}

@external
func set_udc_contract{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    udc_contract: felt
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
