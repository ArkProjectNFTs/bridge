use array::SpanTrait;
use serde::Serde;
use serde::serialize_array_helper;
use serde::deserialize_array_helper;
use array::ArrayTrait;
use core::result::ResultTrait;
use core::traits::Into;
use debug::PrintTrait;
use option::OptionTrait;
use starknet::class_hash::ClassHash;
use starknet::class_hash::Felt252TryIntoClassHash;
use starknet::ContractAddress;
use starknet::contract_address_const;
use traits::TryInto;

#[abi]
trait IBridgableToken {
    fn permissioned_mint(to: ContractAddress, token_id: u256);
}

#[contract]
mod Bridge {
    use super::SpanSerde;
    use starknet::ContractAddress;
    use super::IBridgableTokenDispatcherTrait;
    use super::IBridgableTokenDispatcher;
    use starknet::contract_address_const;

    struct Storage {
        _l1_to_l2_addresses: LegacyMap::<ContractAddress, ContractAddress>
    }

    #[view]
    fn read_l2_address(l1_address: ContractAddress) -> ContractAddress {
        _l1_to_l2_addresses::read(l1_address)
    }

    #[external]
    fn mint_token(
        l1_address: ContractAddress, l2_recipient_address: ContractAddress, token_id: u256
    ) {
        let l2_contract_address: ContractAddress = _l1_to_l2_addresses::read(l1_address);
        if (l2_contract_address != contract_address_const::<0>()) {
            IBridgableTokenDispatcher {
                contract_address: l2_contract_address
            }.permissioned_mint(l2_recipient_address, token_id)
        } else {
            deploy_new_contract()
        }
    }

    #[internal]
    fn deploy_new_contract() {}
}

impl SpanSerde<T,
impl TSerde: Serde<T>,
impl TCopy: Copy<T>,
impl TDrop: Drop<T>> of Serde<Span<T>> {
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
