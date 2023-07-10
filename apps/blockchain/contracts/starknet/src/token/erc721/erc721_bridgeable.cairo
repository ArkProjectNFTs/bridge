///! ERC721 that can be controlled by the bridge.
///!
///! This implementation is temporary as we are waiting
///! the new syntax + OZ updates.
///!
///! But this implementation prodives the building blocks
///! to test the infrastructure.

#[starknet::contract]
mod erc721_bridgeable {
    use starknet::{ContractAddress, ClassHash, };
    use traits::{TryInto, Into};
    use zeroable::Zeroable;
    use starknet::contract_address::ContractAddressZeroable;
    use option::OptionTrait;
    use array::{ArrayTrait, SpanTrait};

    use starklane::token::erc721;

    use starklane::string;
    use starklane::string::LongString;

    use starklane::token::erc721::interfaces::IERC721Bridgeable;

    #[storage]
    struct Storage {
        bridge_addr: ContractAddress,
        collection_owner: ContractAddress,
        name_s: LongString,
        symbol_s: LongString,
        owners: LegacyMap<u256, ContractAddress>,
        operator_approvals: LegacyMap<(ContractAddress, ContractAddress), bool>,
        token_approvals: LegacyMap<u256, ContractAddress>,
        token_uris: LegacyMap<u256, LongString>,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: LongString,
        symbol: LongString,
        bridge_addr: ContractAddress,
        collection_owner: ContractAddress,
    ) {
        assert(!bridge_addr.is_zero(), 'Invalid bridge address');
        assert(!collection_owner.is_zero(), 'Bad collection owner address');
        assert(name.content.len() > 0, 'Bad name len');
        assert(symbol.content.len() > 0, 'Bad symbol len');

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


    #[external(v0)]
    impl ERC721Bridgeable of IERC721Bridgeable<ContractState> {
        //
        // *** VIEWS ***
        //
        fn name(self: @ContractState) -> LongString {
            self.name_s.read()
        }

        fn symbol(self: @ContractState) -> LongString {
            self.symbol_s.read()
        }

        fn owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
            get_owner_of(self, token_id)
        }

        fn is_approved_for_all(
            self: @ContractState, owner: ContractAddress, operator: ContractAddress
        ) -> bool {
            is_approved_for_all_check(self, owner, operator)
        }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            0
        }

        fn token_uri(self: @ContractState, token_id: u256) -> LongString {
            assert(exists(self, token_id), 'ERC721: invalid token ID');
            self.token_uris.read(token_id)
        }

        //
        // *** EXTERNALS ***
        //
        fn permissioned_mint(
            ref self: ContractState, to: ContractAddress, token_id: u256, token_uri: LongString
        ) {
            assert(
                starknet::get_caller_address() == self.bridge_addr.read(),
                'ERC721: only bridge can pmint'
            );

            mint(ref self, to, token_id);
            self.token_uris.write(token_id, token_uri);
        }

        fn simple_mint(
            ref self: ContractState, to: ContractAddress, token_id: u256, token_uri: LongString
        ) {
            mint(ref self, to, token_id);
            self.token_uris.write(token_id, token_uri);
        }

        fn approve(ref self: ContractState, to: ContractAddress, token_id: u256) {
            let owner = get_owner_of(@self, token_id);
            let caller = starknet::get_caller_address();
            assert(
                owner == caller || is_approved_for_all_check(@self, owner, caller),
                'ERC721: unauthorized caller'
            );
            assert(owner != to, 'ERC721: self approval');

            self.token_approvals.write(token_id, to);
            self.emit(Approval { owner, approved: to, token_id });
        }

        fn set_approval_for_all(
            ref self: ContractState, operator: ContractAddress, approved: bool
        ) {
            let owner = starknet::get_caller_address();
            assert(owner != operator, 'ERC721: self approval');
            self.operator_approvals.write((owner, operator), approved);
            self.emit(ApprovalForAll { owner, operator, approved });
        }

        fn transfer_from(
            ref self: ContractState, from: ContractAddress, to: ContractAddress, token_id: u256
        ) {
            assert(!to.is_zero(), 'ERC721: invalid receiver');
            assert(
                is_approved_or_owner_of(@self, starknet::get_caller_address(), token_id),
                'ERC721: unauthorized caller'
            );

            assert(from == get_owner_of(@self, token_id), 'ERC721: wrong sender');

            self.token_approvals.write(token_id, Zeroable::zero());

            self.owners.write(token_id, to);

            self.emit(Transfer { from, to, token_id });
        }

        fn replace_class(ref self: ContractState, class_hash: ClassHash) {
            assert(
                starknet::get_caller_address() == self.collection_owner.read(),
                'Unauthorized replace class'
            );

            match starknet::replace_class_syscall(class_hash) {
                Result::Ok(_) => self
                    .emit(
                        ReplacedClassHash {
                            contract: starknet::get_contract_address(), class: class_hash
                        }
                    ),
                Result::Err(revert_reason) => panic(revert_reason),
            };
        }
    }

    //
    // *** INTERNALS ***
    //
    fn is_approved_for_all_check(
        self: @ContractState, owner: ContractAddress, operator: ContractAddress
    ) -> bool {
        self.operator_approvals.read((owner, operator))
    }

    fn get_owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
        let owner = self.owners.read(token_id);
        assert(!owner.is_zero(), 'ERC721: invalid token ID');
        owner
    }

    fn exists(self: @ContractState, token_id: u256) -> bool {
        !self.owners.read(token_id).is_zero()
    }

    fn is_approved_or_owner_of(
        self: @ContractState, spender: ContractAddress, token_id: u256
    ) -> bool {
        let owner = get_owner_of(self, token_id);
        owner == spender || is_approved_for_all_check(self, owner, spender)
    }

    fn mint(ref self: ContractState, to: ContractAddress, token_id: u256) {
        assert(!to.is_zero(), 'ERC721: invalid receiver');
        assert(!exists(@self, token_id), 'ERC721: token already minted');

        // Update token_id owner
        self.owners.write(token_id, to);

        self.emit(Transfer { from: Zeroable::zero(), to, token_id,  });
    }

    fn burn(ref self: ContractState, token_id: u256) {
        let owner = get_owner_of(@self, token_id);
        self.owners.write(token_id, Zeroable::zero());

        self.emit(Transfer { from: owner, to: Zeroable::zero(), token_id,  });
    }
}

#[cfg(test)]
mod tests {
    use super::erc721_bridgeable;

    use starklane::token::erc721::interfaces::{
        IERC721BridgeableDispatcher, IERC721BridgeableDispatcherTrait
    };

    use serde::Serde;
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;
    use option::OptionTrait;
    use core::result::ResultTrait;
    use traits::{TryInto, Into};
    use starknet::contract_address::Felt252TryIntoContractAddress;
    use starknet::class_hash::Felt252TryIntoClassHash;
    use starknet::{ContractAddress, ClassHash};

    use starklane::token::erc721;
    use starklane::string;
    use starklane::string::{LongString, LongStringSerde};
    use starknet::testing;

    /// Deploy a ERC721Bridgeable instance, reusable in tests.
    fn deploy(
        name: LongString,
        symbol: LongString,
        bridge_addr: ContractAddress,
        collection_owner: ContractAddress,
    ) -> ContractAddress {
        let mut calldata: Array<felt252> = array::ArrayTrait::new();
        name.serialize(ref calldata);
        symbol.serialize(ref calldata);
        calldata.append(bridge_addr.into());
        calldata.append(collection_owner.into());

        let (addr, _) = starknet::deploy_syscall(
            erc721_bridgeable::TEST_CLASS_HASH.try_into().unwrap(), 0, calldata.span(), false
        )
            .expect('deploy_syscall failed');

        addr
    }

    // TODO: replace those functions by constants when
    // the address can be constants...!

    /// Mocked bridge addr.
    fn bridge_addr_mock() -> ContractAddress {
        starknet::contract_address_const::<'bridge'>()
    }

    /// Mocked everai collection owner addr.
    fn collection_owner_addr_mock() -> ContractAddress {
        starknet::contract_address_const::<'everai collec owner'>()
    }

    /// Deploy everai collection.
    fn deploy_everai_collection() -> ContractAddress {
        deploy('everai duo'.into(), 'DUO'.into(), bridge_addr_mock(), collection_owner_addr_mock())
    }

    /// Should have correct constructor valules.
    #[test]
    #[available_gas(2000000000)]
    fn deploy_new() {
        let BRIDGE = bridge_addr_mock();
        let COLLECTION_OWNER = collection_owner_addr_mock();

        let collection_addr = deploy_everai_collection();

        let collection = IERC721BridgeableDispatcher { contract_address: collection_addr };

        let n = collection.name();
        assert(n.content.len() == 1, 'Bad name len');
        assert(*n.content[0] == 'everai duo', 'Bad name content');

        let s = collection.symbol();
        assert(s.content.len() == 1, 'Bad symbol len');
        assert(*s.content[0] == 'DUO', 'Bad symbol content');
    }

    /// Should store some TokenURI inside the storage.
    #[test]
    #[available_gas(2000000000)]
    fn storage_struct() {
        let BRIDGE = bridge_addr_mock();
        let COLLECTION_OWNER = collection_owner_addr_mock();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();
        let TOKEN_ID = 244;

        let collection_addr = deploy_everai_collection();

        let collection = IERC721BridgeableDispatcher { contract_address: collection_addr };

        let new_uri: LongString = 'https:...'.into();
        collection.simple_mint(NEW_DUO_OWNER, TOKEN_ID, new_uri);

        let fetched_uri = collection.token_uri(TOKEN_ID);
        assert(fetched_uri.content.len() == 1_usize, 'Bad uri len');
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
        let BRIDGE = bridge_addr_mock();
        let COLLECTION_OWNER = collection_owner_addr_mock();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();

        let collection_addr = deploy_everai_collection();

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
        let BRIDGE = bridge_addr_mock();
        let COLLECTION_OWNER = collection_owner_addr_mock();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();

        let collection_addr = deploy_everai_collection();

        let collection = IERC721BridgeableDispatcher { contract_address: collection_addr };

        collection.permissioned_mint(NEW_DUO_OWNER, 0, 'myuri'.into());
        assert(collection.owner_of(0) == NEW_DUO_OWNER, 'permission mint failed');
    }

    /// Should transfer tokens.
    #[test]
    #[available_gas(2000000000)]
    fn transfer_tokens() {
        let BRIDGE = bridge_addr_mock();
        let COLLECTION_OWNER = collection_owner_addr_mock();
        let FROM_DUO_OWNER = starknet::contract_address_const::<128>();
        let TO_DUO_OWNER = starknet::contract_address_const::<128>();
        let TOKEN_ID = 0_u256;

        let collection_addr = deploy_everai_collection();

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
        let BRIDGE = bridge_addr_mock();
        let COLLECTION_OWNER = collection_owner_addr_mock();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();
        let TOKEN_ID = 244;

        let collection_addr = deploy_everai_collection();

        let collection = IERC721BridgeableDispatcher { contract_address: collection_addr };

        let new_uri: LongString = 'https:...'.into();
        collection.simple_mint(NEW_DUO_OWNER, TOKEN_ID, new_uri);

        // Unwrap as we should have something we just minted.
        let fetched_uri = erc721::token_uri_from_contract_call(collection_addr, TOKEN_ID).unwrap();
        assert(fetched_uri.content.len() == 1_usize, 'Bad uri len');
        assert(*fetched_uri.content[0] == 'https:...', 'Bad uri content');
    }
}
