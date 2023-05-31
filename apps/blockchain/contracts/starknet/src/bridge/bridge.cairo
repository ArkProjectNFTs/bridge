use core::result::ResultTrait;
use array::SpanTrait;
use serde::Serde;
use serde::serialize_array_helper;
use serde::deserialize_array_helper;
use array::ArrayTrait;
use core::traits::Into;
use debug::PrintTrait;
use option::OptionTrait;
use starknet::class_hash::ClassHash;
use starknet::class_hash::Felt252TryIntoClassHash;
use starknet::ContractAddress;
use traits::TryInto;

#[abi]
trait IBridgableToken {
    fn permissioned_mint(to: ContractAddress, token_id: u256);
    fn owner_of(token_id: u256) -> ContractAddress;
}

#[contract]
mod Bridge {
    use super::IBridgableTokenDispatcherTrait;
    use super::IBridgableTokenDispatcher;
    use super::SpanSerde;
    use starknet::class_hash::ClassHash;
    use array::SpanTrait;
    use array::ArrayTrait;
    use starknet::ContractAddress;
    use starknet::contract_address_const;
    use starknet::syscalls::deploy_syscall;
    use starknet::contract_address_to_felt252;

    struct Storage {
        _l1_to_l2_addresses: LegacyMap::<ContractAddress, ContractAddress>,
        erc721_default_contract: ClassHash
    }

    #[view]
    fn read_l2_address(l1_address: ContractAddress) -> ContractAddress {
        _l1_to_l2_addresses::read(l1_address)
    }

    #[external]
    fn mint_token(
        l1_address: ContractAddress,
        l2_recipient_address: ContractAddress,
        token_id: u256,
        name: felt252,
        symbol: felt252
    ) {
        let l2_contract_address: ContractAddress = _l1_to_l2_addresses::read(l1_address);
        let felt_contract_address: felt252 = contract_address_to_felt252(l2_contract_address);

        if (felt_contract_address != 0) {
            let dispatcher = IBridgableTokenDispatcher { contract_address: l2_contract_address };
            let token_owner_address: ContractAddress = dispatcher.owner_of(token_id);

            // TODO: safeguard against token burning?
            if (contract_address_to_felt252(token_owner_address) == 0) {
                dispatcher.permissioned_mint(l2_recipient_address, token_id);
            } else { // TODO: Transfer from escrow contract
            }
        } else {
            deploy_new_contract(l1_address, l2_recipient_address, name, symbol);
        }
    }

    #[external]
    fn set_erc721_default_contract(contract_address: ClassHash) {
        // TODO: Acess control.
        erc721_default_contract::write(contract_address);
    }

    #[internal]
    fn deploy_new_contract(
        l1_address: ContractAddress,
        l2_recipient_address: ContractAddress,
        name: felt252,
        symbol: felt252
    ) -> ContractAddress {
        // TODO: Determine the contract type (erc721 / erc1155)
        let class_hash: ClassHash = erc721_default_contract::read();

        let salt = pedersen(
            contract_address_to_felt252(l1_address),
            contract_address_to_felt252(l2_recipient_address)
        );

        let mut calldata = ArrayTrait::<felt252>::new();
        calldata.append(name);
        calldata.append(symbol);

        let syscall_result = deploy_syscall(class_hash, salt, calldata.span(), false);
        let (deployed_contract_address, _) = syscall_result.unwrap_syscall();
        _l1_to_l2_addresses::write(l1_address, deployed_contract_address);
        deployed_contract_address
    }
}

impl SpanSerde<
    T, impl TSerde: Serde<T>, impl TCopy: Copy<T>, impl TDrop: Drop<T>
> of Serde<Span<T>> {
    fn serialize(self: @Span<T>, ref output: Array<felt252>) {
        (*self).len().serialize(ref output);
        serialize_array_helper(*self, ref output);
    }
    fn deserialize(ref serialized: Span<felt252>) -> Option<Span<T>> {
        let length = *serialized.pop_front()?;
        let mut arr = ArrayTrait::new();
        Option::Some(deserialize_array_helper(ref serialized, arr, length)?.span())
    }
}
