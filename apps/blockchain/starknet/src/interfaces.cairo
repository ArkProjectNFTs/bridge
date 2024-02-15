use array::{SpanTrait};
use starknet::{ClassHash, ContractAddress, EthAddress};
use starklane::request::Request;

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
    fn get_l2_collection_address(self: @T, address: EthAddress) -> ContractAddress;

    fn set_bridge_l1_addr(ref self: T, address: EthAddress);
    fn get_bridge_l1_addr(self: @T) -> EthAddress;

    fn set_erc721_class_hash(ref self: T, class_hash: ClassHash);
    fn get_erc721_class_hash(self: @T) -> ClassHash;

    fn enable_white_list(ref self: T, enable: bool);
    fn is_white_list_enabled(self: @T) -> bool;
    fn white_list_collection(ref self: T, collection: ContractAddress, enabled: bool);
    fn is_white_listed(self: @T, collection: ContractAddress) -> bool;

    fn enable(ref self: T, enable: bool);
    fn is_enabled(self: @T) -> bool;
}

/// Upgradeable contract.
#[starknet::interface]
trait IUpgradeable<T> {
    fn upgrade(ref self: T, class_hash: ClassHash);
}

//////////////////////////
/// Events
#[derive(Drop, starknet::Event)]
struct ReplacedClassHash {
    contract: ContractAddress,
    class: ClassHash,
}

#[derive(Drop, starknet::Event)]
struct DepositRequestInitiated {
    #[key]
    hash: u256,
    #[key]
    block_timestamp: u64,
    req_content: Request,
}


#[derive(Drop, starknet::Event)]
struct WithdrawRequestCompleted {
    #[key]
    hash: u256,
    #[key]
    block_timestamp: u64,
    req_content: Request
}

#[derive(Drop, starknet::Event)]
struct CollectionDeployedFromL1 {
    #[key]
    l1_addr: EthAddress,
    #[key]
    l2_addr: ContractAddress,
    name: ByteArray,
    symbol: ByteArray
}


#[derive(Drop, starknet::Event)]
struct BridgeEnabled {
    enable: bool,
}