// SPDX-License-Identifier: MIT

%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256, uint256_unsigned_div_rem
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.math import assert_not_zero
from starkware.cairo.common.alloc import alloc
from openzeppelin.access.ownable.library import Ownable
from starkware.starknet.common.syscalls import get_contract_address

@contract_interface
namespace IUniversalDeployerContract {
    func deployContract(
        classHash: felt, salt: felt, unique: felt, calldata_len: felt, calldata: felt*
    ) -> (address: felt) {
    }
}

@contract_interface
namespace IDefaultToken {
    func permissionedMint(to: felt, tokenId: Uint256, data_len: felt, data: felt*, tokenURI: felt) {
    }
}

@event
func collection_created(address: felt) {
}

@storage_var
func _l1_to_l2_addresses(l1_address: felt) -> (l1_address: felt) {
}

@storage_var
func _contract_salt() -> (salt: felt) {
}

@storage_var
func _token_class_hash() -> (res: felt) {
}

@storage_var
func _udc_contract() -> (res: felt) {
}

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    owner: felt, class_hash: felt, initial_salt: felt, udc_contract: felt
) {
    Ownable.initializer(owner);
    _token_class_hash.write(class_hash);
    _contract_salt.write(initial_salt);
    _udc_contract.write(udc_contract);
    return ();
}

@external
func handle_message{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    l1_contract_address: felt,
    to: felt,
    token_id: Uint256,
    data_len: felt,
    data: felt*,
    name: felt,
    symbol: felt,
    token_uri: felt,
) -> (contract_address: felt) {
    alloc_locals;

    let (contract_address) = _l1_to_l2_addresses.read(l1_contract_address);
    if (contract_address == 0) {
        let (deployed_contract_address) = deploy_new_contract(l1_contract_address, name, symbol);
        mint(
            contract_address=deployed_contract_address,
            token_id=token_id,
            to=to,
            token_uri=token_uri,
        );
        return (contract_address=deployed_contract_address);
    } else {
        mint(contract_address=contract_address, token_id=token_id, to=to, token_uri=token_uri);
        return (contract_address=contract_address);
    }
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

func mint{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    contract_address: felt, token_id: Uint256, to: felt, token_uri: felt
) {
    alloc_locals;
    let (data: felt*) = alloc();

    IDefaultToken.permissionedMint(
        contract_address=contract_address,
        to=to,
        tokenId=token_id,
        data_len=0,
        data=data,
        tokenURI=token_uri,
    );

    return ();
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
    Ownable.assert_only_owner();
    _udc_contract.write(udc_contract);
    return ();
}

@view
func get_token_class_hash{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    res: felt
) {
    let (res) = _token_class_hash.read();
    return (res=res);
}

@view
func get_salt{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (salt: felt) {
    let (salt) = _contract_salt.read();
    return (salt=salt);
}

@view
func get_l2_address{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    l1_address: felt
) -> (l2_address: felt) {
    let (l2_address) = _l1_to_l2_addresses.read(l1_address);
    return (l2_address,);
}
