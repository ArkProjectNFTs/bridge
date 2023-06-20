///! ERC721 that can be controlled by the bridge.
///!
///! This implementation is temporary as we are waiting
///! the new syntax + OZ updates.
///!
///! But this implementation prodives the building blocks
///! to test the infrastructure.

#[contract]
mod ERC721Bridgeable {
    use starknet::{
        ContractAddress,
        ClassHash,
    };
    use traits::{TryInto, Into};
    use zeroable::Zeroable;
    use option::OptionTrait;

    use starklane::token::erc721::{TokenURI, StorageAccessTokenURI, Felt252IntoTokenURI};

    struct Storage {
        _bridge_addr: ContractAddress,
        _collection_owner: ContractAddress,
        _name: felt252,
        _symbol: felt252,
        _owners: LegacyMap<u256, ContractAddress>,
        _operator_approvals: LegacyMap<(ContractAddress, ContractAddress), bool>,
        _token_approvals: LegacyMap<u256, ContractAddress>,
        _token_uri: LegacyMap<u256, TokenURI>,
    }

    #[constructor]
    fn constructor(
        name: felt252,
        symbol: felt252,
        bridge_addr: ContractAddress,
        collection_owner: ContractAddress,
    ) {
        assert(!bridge_addr.is_zero(), 'Invalid bridge address');
        assert(!collection_owner.is_zero(), 'Bad collection owner address');

        _name::write(name);
        _symbol::write(symbol);
        _bridge_addr::write(bridge_addr);
        _collection_owner::write(collection_owner);
    }

    // *** EVENTS ***
    #[event]
    fn Transfer(from: ContractAddress, to: ContractAddress, token_id: u256) {}

    #[event]
    fn Approval(owner: ContractAddress, approved: ContractAddress, token_id: u256) {}

    #[event]
    fn ApprovalForAll(owner: ContractAddress, operator: ContractAddress, approved: bool) {}

    #[event]
    fn ReplacedClassHash(contract: ContractAddress, class: ClassHash) {}

    //
    // *** VIEWS ***
    //
    #[view]
    fn name() -> felt252 {
        _name::read()
    }

    #[view]
    fn symbol() -> felt252 {
        _symbol::read()
    }

    #[view]
    fn owner_of(token_id: u256) -> ContractAddress {
        let owner = _owners::read(token_id);
        assert(!owner.is_zero(), 'ERC721: invalid token ID');
        owner
    }

    #[view]
    fn is_approved_for_all(owner: ContractAddress, operator: ContractAddress) -> bool {
        _operator_approvals::read((owner, operator))
    }

    #[view]
    fn token_uri(token_id: u256) -> TokenURI {
        assert(_exists(token_id), 'ERC721: invalid token ID');
        //let token_uri = _token_uri::read(token_id); << can't do that.. x( Need custom storage.
        'ahaha'.into()
    }

    //
    // *** EXTERNALS ***
    //

    #[external]
    fn permissioned_mint(to: ContractAddress, token_id: u256) {
        assert(starknet::get_caller_address() == _bridge_addr::read(),
               'ERC721: only bridge can pmint');

        _mint(to, token_id);
    }

    #[cfg(test)]
    #[external]
    fn mint_with_uri(to: ContractAddress, token_id: u256, token_uri: TokenURI) {
        _mint(to, token_id);
        //_token_uri::write(token_id, token_uri);
    }

    #[external]
    fn approve(to: ContractAddress, token_id: u256) {
        let owner = owner_of(token_id);
        let caller = starknet::get_caller_address();
        assert(owner == caller | is_approved_for_all(owner, caller), 'ERC721: unauthorized caller');
        assert(owner != to, 'ERC721: self approval');

        _token_approvals::write(token_id, to);
        Approval(owner, to, token_id);
    }

    #[external]
    fn set_approval_for_all(operator: ContractAddress, approved: bool) {
        let owner = starknet::get_caller_address();
        assert(owner != operator, 'ERC721: self approval');
        _operator_approvals::write((owner, operator), approved);
        ApprovalForAll(owner, operator, approved);
    }

    #[external]
    fn transfer_from(from: ContractAddress, to: ContractAddress, token_id: u256) {
        assert(!to.is_zero(), 'ERC721: invalid receiver');
        assert(_is_approved_or_owner_of(starknet::get_caller_address(), token_id),
               'ERC721: unauthorized caller');

        assert(from == owner_of(token_id), 'ERC721: wrong sender');

        _token_approvals::write(token_id, Zeroable::zero());

        _owners::write(token_id, to);

        Transfer(from, to, token_id);
    }

    #[external]
    fn replace_class(class_hash: ClassHash) {
        assert(starknet::get_caller_address() == _collection_owner::read(),
               'Unauthorized replace class');

        match starknet::replace_class_syscall(class_hash) {
            Result::Ok(_) => ReplacedClassHash(starknet::get_contract_address(), class_hash),
            Result::Err(revert_reason) => panic(revert_reason),
        };
    }

    //
    // *** INTERNALS ***
    //

    #[internal]
    fn _exists(token_id: u256) -> bool {
        !_owners::read(token_id).is_zero()
    }

    #[internal]
    fn _is_approved_or_owner_of(spender: ContractAddress, token_id: u256) -> bool {
        let owner = owner_of(token_id);
        owner == spender | is_approved_for_all(owner, spender)
    }

    #[internal]
    fn _mint(to: ContractAddress, token_id: u256) {
        assert(!to.is_zero(), 'ERC721: invalid receiver');
        assert(!_exists(token_id), 'ERC721: token already minted');

        // Update token_id owner
        _owners::write(token_id, to);

        // Emit event
        Transfer(Zeroable::zero(), to, token_id);
    }

    #[internal]
    fn _burn(token_id: u256) {
        let owner = owner_of(token_id);
        _owners::write(token_id, Zeroable::zero());
        Transfer(owner, Zeroable::zero(), token_id);
    }

}

#[cfg(test)]
mod tests {
    use super::ERC721Bridgeable;

    use starklane::token::erc721::interfaces::{IERC721BridgeableDispatcher, IERC721BridgeableDispatcherTrait};

    use serde::Serde;
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;
    use option::OptionTrait;
    use core::result::ResultTrait;
    use traits::{TryInto, Into};
    use starknet::contract_address::Felt252TryIntoContractAddress;
    use starknet::class_hash::Felt252TryIntoClassHash;
    use starknet::{ContractAddress,ClassHash};

    use starklane::token::erc721::{TokenURI, StorageAccessTokenURI, Felt252IntoTokenURI};

    use starknet::testing;

    /// Deploy a ERC721Bridgeable instance, reusable in tests.
    fn deploy(
        name: felt252,
        symbol: felt252,
        bridge_addr: ContractAddress,
        collection_owner: ContractAddress,
    ) -> ContractAddress {

        let mut calldata: Array<felt252> = array::ArrayTrait::new();
        calldata.append(name);
        calldata.append(symbol);
        calldata.append(bridge_addr.into());
        calldata.append(collection_owner.into());

        let (addr, _) = starknet::deploy_syscall(
            ERC721Bridgeable::TEST_CLASS_HASH.try_into().unwrap(),
            0,
            calldata.span(),
            false).expect('deploy_syscall failed');

        addr
    }

    /// Should have correct constructor valules.
    #[test]
    #[available_gas(2000000000)]
    fn deploy_new() {
        let BRIDGE = starknet::contract_address_const::<77>();
        let COLLECTION_OWNER = starknet::contract_address_const::<88>();

        let collection_addr = deploy('everai duo', 'DUO', BRIDGE, COLLECTION_OWNER);

        let collection = IERC721BridgeableDispatcher { contract_address: collection_addr };

        assert(collection.name() == 'everai duo', 'Bad name');
        assert(collection.symbol() == 'DUO', 'Bad symbol');
    }

    /// Should store some TokenURI inside the storage.
    #[test]
    #[available_gas(2000000000)]
    fn storage_struct() {
        let BRIDGE = starknet::contract_address_const::<77>();
        let COLLECTION_OWNER = starknet::contract_address_const::<88>();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();
        let TOKEN_ID = 244;

        let collection_addr = deploy('everai duo', 'DUO', BRIDGE, COLLECTION_OWNER);

        let collection = IERC721BridgeableDispatcher { contract_address: collection_addr };
        
        let new_uri: TokenURI = 'https:...'.into();
        collection.mint_with_uri(NEW_DUO_OWNER, TOKEN_ID, new_uri);

        // let fetched_uri = collection.token_uri(TOKEN_ID);
        // assert(fetched_uri.len == 1, 'Bad uri len');
        // assert(*fetched_uri.content[0] == 'https:...', 'Bad uri content');
    }

    /// Should mint token from bridge call.
    #[test]
    #[available_gas(2000000000)]
    fn permissioned_mint() {
        let BRIDGE = starknet::contract_address_const::<77>();
        let COLLECTION_OWNER = starknet::contract_address_const::<88>();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();

        let collection_addr = deploy('everai duo', 'DUO', BRIDGE, COLLECTION_OWNER);
        let collection = IERC721BridgeableDispatcher { contract_address: collection_addr };

        testing::set_contract_address(BRIDGE);
        collection.permissioned_mint(NEW_DUO_OWNER, 0);
        assert(collection.owner_of(0) == NEW_DUO_OWNER, 'permission mint failed');
    }

    /// Should not mint token if not bridge.
    #[test]
    #[should_panic()]
    #[available_gas(2000000000)]
    fn permissioned_mint_fail() {
        let BRIDGE = starknet::contract_address_const::<77>();
        let COLLECTION_OWNER = starknet::contract_address_const::<88>();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();

        let collection_addr = deploy('everai duo', 'DUO', BRIDGE, COLLECTION_OWNER);
        let collection = IERC721BridgeableDispatcher { contract_address: collection_addr };

        collection.permissioned_mint(NEW_DUO_OWNER, 0);
        assert(collection.owner_of(0) == NEW_DUO_OWNER, 'permission mint failed');
    }

    /// Should transfer tokens.
    #[test]
    #[available_gas(2000000000)]
    fn transfer_tokens() {
        let BRIDGE = starknet::contract_address_const::<77>();
        let COLLECTION_OWNER = starknet::contract_address_const::<88>();
        let FROM_DUO_OWNER = starknet::contract_address_const::<128>();
        let TO_DUO_OWNER = starknet::contract_address_const::<128>();
        let TOKEN_ID = 0_u256;

        let collection_addr = deploy('everai duo', 'DUO', BRIDGE, COLLECTION_OWNER);
        let collection = IERC721BridgeableDispatcher { contract_address: collection_addr };

        testing::set_contract_address(BRIDGE);
        collection.permissioned_mint(FROM_DUO_OWNER, TOKEN_ID);
        assert(collection.owner_of(TOKEN_ID) == FROM_DUO_OWNER, 'permission mint failed');

        testing::set_contract_address(FROM_DUO_OWNER);
        collection.transfer_from(FROM_DUO_OWNER, TO_DUO_OWNER, TOKEN_ID);
        assert(collection.owner_of(TOKEN_ID) == TO_DUO_OWNER, 'transfer failed');
    }

}
