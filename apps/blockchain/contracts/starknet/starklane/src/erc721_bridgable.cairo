use array::ArrayTrait;
use core::traits::Into;
use debug::PrintTrait;
use option::OptionTrait;
use starknet::class_hash::ClassHash;
use starknet::class_hash::Felt252TryIntoClassHash;
use starknet::ContractAddress;
use traits::TryInto;

#[contract]
mod ERC721 {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use zeroable::Zeroable;
    use option::OptionTrait;
    use array::SpanTrait;
    use traits::Into;

    struct Storage {
        _name: felt252,
        _symbol: felt252,
        _owners: LegacyMap<u256, ContractAddress>,
        _balances: LegacyMap<ContractAddress, u256>,
        _token_approvals: LegacyMap<u256, ContractAddress>,
        _operator_approvals: LegacyMap<(ContractAddress, ContractAddress), bool>,
        _token_uri: LegacyMap<u256, felt252>,
    }

    #[event]
    fn Transfer(from: ContractAddress, to: ContractAddress, token_id: u256) {}

    #[event]
    fn Approval(owner: ContractAddress, approved: ContractAddress, token_id: u256) {}

    #[event]
    fn ApprovalForAll(owner: ContractAddress, operator: ContractAddress, approved: bool) {}

    #[constructor]
    fn constructor(name: felt252, symbol: felt252) {
        initializer(name, symbol);
    }

    // View

    #[view]
    fn supports_interface(interface_id: u32) -> bool {
        if (interface_id == 0x01ffc9a7_u32) {
            return true;
        }

        if (interface_id == 0x80ac58cd_u32) {
            return true;
        }

        if (interface_id == 0x5b5e139f_u32) {
            return true;
        }

        return false;
    }

    #[view]
    fn name() -> felt252 {
        _name::read()
    }

    #[view]
    fn symbol() -> felt252 {
        _symbol::read()
    }

    #[view]
    fn token_uri(token_id: u256) -> felt252 {
        assert(_exists(token_id), 'ERC721: invalid token ID');
        _token_uri::read(token_id)
    }

    #[view]
    fn balance_of(account: ContractAddress) -> u256 {
        assert(!account.is_zero(), 'ERC721: invalid account');
        _balances::read(account)
    }

    #[view]
    fn owner_of(token_id: u256) -> ContractAddress {
        _owner_of(token_id).expect('ERC721: invalid token ID')
    }

    #[view]
    fn get_approved(token_id: u256) -> ContractAddress {
        assert(_exists(token_id), 'ERC721: invalid token ID');
        _token_approvals::read(token_id)
    }

    #[view]
    fn is_approved_for_all(owner: ContractAddress, operator: ContractAddress) -> bool {
        _operator_approvals::read((owner, operator))
    }

    // External

    #[external]
    fn permissioned_mint(to: ContractAddress, token_id: u256) {
        // TODO: access control
        _safe_mint(to, token_id)
    }

    #[external]
    fn approve(to: ContractAddress, token_id: u256) {
        let owner = _owner_of(token_id).expect('ERC721: invalid token ID');

        let caller = get_caller_address();
        assert(owner == caller | is_approved_for_all(owner, caller), 'ERC721: unauthorized caller');
        _approve(to, token_id);
    }

    #[external]
    fn set_approval_for_all(operator: ContractAddress, approved: bool) {
        _set_approval_for_all(get_caller_address(), operator, approved)
    }

    #[external]
    fn transfer_from(from: ContractAddress, to: ContractAddress, token_id: u256) {
        assert(
            _is_approved_or_owner(get_caller_address(), token_id), 'ERC721: unauthorized caller'
        );
        _transfer(from, to, token_id);
    }

    #[external]
    fn safe_transfer_from(from: ContractAddress, to: ContractAddress, token_id: u256) {
        assert(
            _is_approved_or_owner(get_caller_address(), token_id), 'ERC721: unauthorized caller'
        );
        _safe_transfer(from, to, token_id);
    }

    // Internal

    #[internal]
    fn initializer(name_: felt252, symbol_: felt252) {
        _name::write(name_);
        _symbol::write(symbol_);
    }

    #[internal]
    fn _owner_of(token_id: u256) -> Option<ContractAddress> {
        let owner = _owners::read(token_id);
        match owner.is_zero() {
            bool::False(()) => Option::Some(owner),
            bool::True(()) => Option::None(())
        }
    }

    #[internal]
    fn _exists(token_id: u256) -> bool {
        !_owners::read(token_id).is_zero()
    }

    #[internal]
    fn _is_approved_or_owner(spender: ContractAddress, token_id: u256) -> bool {
        let owner = _owner_of(token_id).expect('ERC721: invalid token ID');
        owner == spender | is_approved_for_all(owner, spender) | spender == get_approved(token_id)
    }

    #[internal]
    fn _approve(to: ContractAddress, token_id: u256) {
        let owner = _owner_of(token_id).expect('ERC721: invalid token ID');
        assert(owner != to, 'ERC721: approval to owner');
        _token_approvals::write(token_id, to);
        Approval(owner, to, token_id);
    }

    #[internal]
    fn _set_approval_for_all(owner: ContractAddress, operator: ContractAddress, approved: bool) {
        assert(owner != operator, 'ERC721: self approval');
        _operator_approvals::write((owner, operator), approved);
        ApprovalForAll(owner, operator, approved);
    }

    #[internal]
    fn _mint(to: ContractAddress, token_id: u256) {
        assert(!to.is_zero(), 'ERC721: invalid receiver');
        assert(!_exists(token_id), 'ERC721: token already minted');

        // Update balances
        _balances::write(to, _balances::read(to) + 1.into());

        // Update token_id owner
        _owners::write(token_id, to);

        // Emit event
        Transfer(Zeroable::zero(), to, token_id);
    }

    #[internal]
    fn _transfer(from: ContractAddress, to: ContractAddress, token_id: u256) {
        assert(!to.is_zero(), 'ERC721: invalid receiver');
        let owner = _owner_of(token_id).expect('ERC721: invalid token ID');
        assert(from == owner, 'ERC721: wrong sender');

        // Implicit clear approvals, no need to emit an event
        _token_approvals::write(token_id, Zeroable::zero());

        // Update balances
        _balances::write(from, _balances::read(from) - 1.into());
        _balances::write(to, _balances::read(to) + 1.into());

        // Update token_id owner
        _owners::write(token_id, to);

        // Emit event
        Transfer(from, to, token_id);
    }

    #[internal]
    fn _burn(token_id: u256) {
        let owner = _owner_of(token_id).expect('ERC721: invalid token ID');

        // Implicit clear approvals, no need to emit an event
        _token_approvals::write(token_id, Zeroable::zero());

        // Update balances
        _balances::write(owner, _balances::read(owner) - 1.into());

        // Delete owner
        _owners::write(token_id, Zeroable::zero());

        // Emit event
        Transfer(owner, Zeroable::zero(), token_id);
    }

    #[internal]
    fn _safe_mint(to: ContractAddress, token_id: u256) {
        _mint(to, token_id);
        assert(
            _check_on_erc721_received(Zeroable::zero(), to, token_id), 'ERC721: safe mint failed'
        );
    }

    #[internal]
    fn _safe_transfer(from: ContractAddress, to: ContractAddress, token_id: u256) {
        _transfer(from, to, token_id);
        assert(_check_on_erc721_received(from, to, token_id), 'ERC721: safe transfer failed');
    }

    #[internal]
    fn _set_token_uri(token_id: u256, token_uri: felt252) {
        assert(_exists(token_id), 'ERC721: invalid token ID');
        _token_uri::write(token_id, token_uri)
    }

    #[private]
    fn _check_on_erc721_received(
        from: ContractAddress, to: ContractAddress, token_id: u256
    ) -> bool {
        // TODO
        return true;
    }
}
