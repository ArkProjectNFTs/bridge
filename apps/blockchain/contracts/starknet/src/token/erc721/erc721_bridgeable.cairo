///! ERC721 that can be controlled by the bridge.
///!
///! This implementation is temporary as we are waiting
///! the new syntax + OZ updates.
///!
///! But this implementation prodives the building blocks
///! to test the infrastructure.

#[starknet::contract]
mod ERC721Bridgeable {
    use starknet::{
        ContractAddress,
        ClassHash,
    };
    use traits::{TryInto, Into};
    use zeroable::Zeroable;
    use option::OptionTrait;

    use starklane::token::erc721::{TokenURI, Felt252IntoTokenURI};
    use starklane::token::erc721;

    const TOKEN_URI_STORAGE_KEY: felt252 = 0x02d07e6382159ff0f968cba39fe4bab5a235b914d9e4d8730955c0f54f24f433;

    #[storage]
    struct Storage {
        bridge_addr: ContractAddress,
        collection_owner: ContractAddress,
        name_s: felt252,
        symbol_s: felt252,
        owners: LegacyMap<u256, ContractAddress>,
        operator_approvals: LegacyMap<(ContractAddress, ContractAddress), bool>,
        token_approvals: LegacyMap<u256, ContractAddress>,
    }

    #[constructor]
    fn init(
        ref self: ContractState,
        name: felt252,
        symbol: felt252,
        bridge_addr: ContractAddress,
        collection_owner: ContractAddress,
    ) {
        assert(!bridge_addr.is_zero(), 'Invalid bridge address');
        assert(!collection_owner.is_zero(), 'Bad collection owner address');

        self.name_s.write(name);
        self.symbol_s.write(symbol);
        self.bridge_addr.write(bridge_addr);
        self.collection_owner.write(collection_owner);
    }

    //
    // *** EVENTS ***
    //
    // TODO: check when it will be possible to declare
    // those events outside of the contract impl.
    //
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
        Approval: Approval,
        ApprovalForAll: ApprovalForAll,
        ReplacedClassHash: ReplacedClassHash,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        from: ContractAddress,
        to: ContractAddress,
        token_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Approval {
        owner: ContractAddress,
        approved: ContractAddress,
        token_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct ApprovalForAll {
        owner: ContractAddress,
        operator: ContractAddress,
        approved: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct ReplacedClassHash {
        contract: ContractAddress,
        class: ClassHash,
    }


    //
    // *** VIEWS ***
    //
    #[external(v0)]
    fn name(self: @ContractState) -> felt252 {
        self.name_s.read()
    }

    #[external(v0)]
    fn symbol(self: @ContractState) -> felt252 {
        self.symbol_s.read()
    }

    #[external(v0)]
    fn owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
        let owner = self.owners.read(token_id);
        assert(!owner.is_zero(), 'ERC721: invalid token ID');
        owner
    }

    #[external(v0)]
    fn is_approved_for_all(self: @ContractState, owner: ContractAddress, operator: ContractAddress) -> bool {
        self.operator_approvals.read((owner, operator))
    }

    #[external(v0)]
    fn token_uri(self: @ContractState, token_id: u256) -> TokenURI {
        assert(exists(self, token_id), 'ERC721: invalid token ID');
        erc721::token_uri_from_storage(TOKEN_URI_STORAGE_KEY, token_id)
    }

    //
    // *** EXTERNALS ***
    //
    #[external(v0)]
    fn permissioned_mint(ref self: ContractState, to: ContractAddress, token_id: u256, token_uri: TokenURI) {
        assert(starknet::get_caller_address() == self.bridge_addr.read(),
               'ERC721: only bridge can pmint');

        mint(ref self, to, token_id);

        erc721::token_uri_to_storage(TOKEN_URI_STORAGE_KEY, token_id, @token_uri);
    }

    #[external(v0)]
    fn simple_mint(ref self: ContractState, to: ContractAddress, token_id: u256, token_uri: TokenURI) {
        mint(ref self, to, token_id);
        erc721::token_uri_to_storage(TOKEN_URI_STORAGE_KEY, token_id, @token_uri);
    }

    #[external(v0)]
    fn approve(ref self: ContractState, to: ContractAddress, token_id: u256) {
        let owner = owner_of(@self, token_id);
        let caller = starknet::get_caller_address();
        assert(owner == caller || is_approved_for_all(@self, owner, caller), 'ERC721: unauthorized caller');
        assert(owner != to, 'ERC721: self approval');

        self.token_approvals.write(token_id, to);
        self.emit(Approval { owner, approved: to, token_id });
    }

    #[external(v0)]
    fn set_approval_for_all(ref self: ContractState, operator: ContractAddress, approved: bool) {
        let owner = starknet::get_caller_address();
        assert(owner != operator, 'ERC721: self approval');
        self.operator_approvals.write((owner, operator), approved);
        self.emit(ApprovalForAll { owner, operator, approved });
    }

    #[external(v0)]
    fn transfer_from(ref self: ContractState, from: ContractAddress, to: ContractAddress, token_id: u256) {
        assert(!to.is_zero(), 'ERC721: invalid receiver');
        assert(is_approved_or_owner_of(@self, starknet::get_caller_address(), token_id),
               'ERC721: unauthorized caller');

        assert(from == owner_of(@self, token_id), 'ERC721: wrong sender');

        self.token_approvals.write(token_id, Zeroable::zero());

        self.owners.write(token_id, to);

        self.emit(Transfer { from, to, token_id });
    }

    #[external(v0)]
    fn replace_class(ref self: ContractState, class_hash: ClassHash) {
        assert(starknet::get_caller_address() == self.collection_owner.read(),
               'Unauthorized replace class');

        match starknet::replace_class_syscall(class_hash) {
            Result::Ok(_) => self.emit(ReplacedClassHash {
                contract: starknet::get_contract_address(),
                class: class_hash
            }),
            Result::Err(revert_reason) => panic(revert_reason),
        };
    }

    //
    // *** INTERNALS ***
    //
    fn exists(self: @ContractState, token_id: u256) -> bool {
        !self.owners.read(token_id).is_zero()
    }

    fn is_approved_or_owner_of(self: @ContractState, spender: ContractAddress, token_id: u256) -> bool {
        let owner = owner_of(self, token_id);
        owner == spender || is_approved_for_all(self, owner, spender)
    }

    fn mint(ref self: ContractState, to: ContractAddress, token_id: u256) {
        assert(!to.is_zero(), 'ERC721: invalid receiver');
        assert(!exists(@self, token_id), 'ERC721: token already minted');

        // Update token_id owner
        self.owners.write(token_id, to);

        self.emit(Transfer {
            from: Zeroable::zero(),
            to,
            token_id,
        });
    }

    fn burn(ref self: ContractState, token_id: u256) {
        let owner = owner_of(@self, token_id);
        self.owners.write(token_id, Zeroable::zero());

        self.emit(Transfer {
            from: owner,
            to: Zeroable::zero(),
            token_id,
        });
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

    use starklane::token::erc721::{TokenURI, Felt252IntoTokenURI};
    use starklane::token::erc721;

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
        collection.simple_mint(NEW_DUO_OWNER, TOKEN_ID, new_uri);

        let fetched_uri = collection.token_uri(TOKEN_ID);
        assert(fetched_uri.len == 1_usize, 'Bad uri len');
        assert(*fetched_uri.content[0] == 'https:...', 'Bad uri content');

        // Test that the storage is well separated by contract address.
        // Calling collection2 token uri will revert saying Invalid Token ID,
        // this is what we are expecting.
        // let collection2_addr = deploy('everai duo 2', 'DUO2', BRIDGE, COLLECTION_OWNER);
        // let collection2 = IERC721BridgeableDispatcher { contract_address: collection2_addr };
        // collection2.token_uri(TOKEN_ID);
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
        collection.permissioned_mint(NEW_DUO_OWNER, 0, 'myuri'.into());
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

        collection.permissioned_mint(NEW_DUO_OWNER, 0, 'myuri'.into());
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
        collection.permissioned_mint(FROM_DUO_OWNER, TOKEN_ID, 'myuri'.into());
        assert(collection.owner_of(TOKEN_ID) == FROM_DUO_OWNER, 'permission mint failed');

        testing::set_contract_address(FROM_DUO_OWNER);
        collection.transfer_from(FROM_DUO_OWNER, TO_DUO_OWNER, TOKEN_ID);
        assert(collection.owner_of(TOKEN_ID) == TO_DUO_OWNER, 'transfer failed');
    }

    /// Should get a token uri from contract call. This will try tokenURI and token_uri selectors.
    #[test]
    #[available_gas(2000000000)]
    fn token_uri_from_contract_call() {
        let BRIDGE = starknet::contract_address_const::<77>();
        let COLLECTION_OWNER = starknet::contract_address_const::<88>();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();
        let TOKEN_ID = 244;

        let collection_addr = deploy('everai duo', 'DUO', BRIDGE, COLLECTION_OWNER);

        let collection = IERC721BridgeableDispatcher { contract_address: collection_addr };
        
        let new_uri: TokenURI = 'https:...'.into();
        collection.simple_mint(NEW_DUO_OWNER, TOKEN_ID, new_uri);

        // Unwrap as we should have something as we just minted it.
        let fetched_uri = erc721::token_uri_from_contract_call(collection_addr, TOKEN_ID).unwrap();
        assert(fetched_uri.len == 1_usize, 'Bad uri len');
        assert(*fetched_uri.content[0] == 'https:...', 'Bad uri content');        
    }


}
