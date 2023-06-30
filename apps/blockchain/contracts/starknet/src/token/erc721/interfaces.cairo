use starknet::{ContractAddress, ClassHash};
use starklane::string::LongString;

#[starknet::interface]
trait IERC721Bridgeable<T> {
    fn name(self: @T) -> felt252;
    fn symbol(self: @T) -> felt252;
    fn balance_of(self: @T, account: ContractAddress) -> u256;
    fn owner_of(self: @T, token_id: u256) -> ContractAddress;
    fn token_uri(self: @T, token_id: u256) -> LongString;
    fn is_approved_for_all(
        self: @T,
        owner: ContractAddress,
        operator: ContractAddress) -> bool;

    fn permissioned_mint(ref self: T,
                         to: ContractAddress,
                         token_id: u256,
                         token_uri: LongString);

    fn simple_mint(ref self: T,
                   to: ContractAddress,
                   token_id: u256,
                   token_uri: LongString);

    fn set_approval_for_all(ref self: T, operator: ContractAddress, approved: bool);
    fn transfer_from(ref self: T, from: ContractAddress, to: ContractAddress, token_id: u256);
    fn replace_class(ref self: T, class_hash: ClassHash);
    fn approve(ref self: T, to: ContractAddress, token_id: u256);
}
