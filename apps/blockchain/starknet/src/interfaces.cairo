use array::{SpanTrait};
use starknet::{ClassHash, ContractAddress, EthAddress};

#[starknet::interface]
trait IStarklane<T> {

    fn deposit_tokens(
        ref self: T,
        salt: felt252,
        collection_l2: ContractAddress,
        owner_l1: EthAddress,
        token_ids: Span<u256>,
        use_withdraw_auto: bool,
        use_deposit_burn_auto: bool,
    );

    fn get_l1_collection_address(self: @T, address: ContractAddress) -> EthAddress;
    fn get_l2_collection_address(self: @T, address: felt252) -> ContractAddress;

    fn set_bridge_l1_addr(ref self: T, address: EthAddress);
    fn get_bridge_l1_addr(self: @T) -> EthAddress;

    fn set_erc721_class_hash(ref self: T, class_hash: ClassHash);
    fn get_erc721_class_hash(self: @T) -> ClassHash;
}

/// Upgradeable contract.
#[starknet::interface]
trait IUpgradeable<T> {
    fn upgrade(ref self: T, class_hash: ClassHash);
}


/// TODO: define events here when possible? Is it possible? Test it.

// #[derive(Drop, starknet::Event)]
// struct ReplacedClassHash {
//     contract: ContractAddress,
//     class: ClassHash,
// }

