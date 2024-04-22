use starknet::{ContractAddress, ClassHash};

#[starknet::interface]
trait IERC721<T> {
    fn name(self: @T) -> ByteArray;
    fn symbol(self: @T) -> ByteArray;
    fn owner_of(self: @T, token_id: u256) -> ContractAddress;
    fn token_uri(self: @T, token_id: u256) -> ByteArray;
    fn is_approved_for_all(self: @T, owner: ContractAddress, operator: ContractAddress) -> bool;

    fn set_approval_for_all(ref self: T, operator: ContractAddress, approved: bool);
    fn transfer_from(ref self: T, from: ContractAddress, to: ContractAddress, token_id: u256);
    fn approve(ref self: T, to: ContractAddress, token_id: u256);
}

#[starknet::interface]
trait IERC721Uri<T> {
    fn base_uri(self: @T) -> ByteArray;
    fn set_base_uri(ref self: T, base_uri: ByteArray);
    fn set_token_uri(ref self: T, token_id: u256, token_uri: ByteArray);
}

#[starknet::interface]
trait IERC721Mintable<T> {
    fn mint(ref self: T, to: ContractAddress, token_id: u256);
    fn mint_range(ref self: T, to: ContractAddress, start: u256, end: u256);
    fn mint_uri(ref self: T, to: ContractAddress, token_id: u256, token_uri: ByteArray);
}

/// ERC721 that can be manipulated by the bridge.
#[starknet::interface]
trait IERC721Bridgeable<T> {
    fn mint_from_bridge(ref self: T, to: ContractAddress, token_id: u256);

    fn mint_from_bridge_uri(ref self: T, to: ContractAddress, token_id: u256, token_uri: ByteArray);
}
