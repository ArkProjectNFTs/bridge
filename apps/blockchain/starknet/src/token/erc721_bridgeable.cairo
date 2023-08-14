///! ERC721 that can be controlled by the bridge.
///!
///! This implementation is temporary as we are waiting
///! the components + OZ updates.

#[starknet::contract]
mod erc721_bridgeable {
    use starknet::{ContractAddress, ClassHash};
    use traits::{TryInto, Into};
    use zeroable::Zeroable;
    use starknet::contract_address::ContractAddressZeroable;
    use option::OptionTrait;
    use array::{ArrayTrait, SpanTrait};

    use starklane::string::{
        LongString, Felt252IntoLongString,
        long_string_storage_read, long_string_storage_write
    };

    use starklane::token::interfaces::{IERC721, IERC721Bridgeable};
    use starklane::interfaces::IUpgradeable;

    #[storage]
    struct Storage {
        bridge: ContractAddress,
        collection_owner: ContractAddress,
        owners: LegacyMap<u256, ContractAddress>,
        operator_approvals: LegacyMap<(ContractAddress, ContractAddress), bool>,
        token_approvals: LegacyMap<u256, ContractAddress>,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: LongString,
        symbol: LongString,
        bridge: ContractAddress,
        collection_owner: ContractAddress,
    ) {
        assert(!bridge.is_zero(), 'Invalid bridge address');
        assert(!collection_owner.is_zero(), 'Bad collection owner address');

        long_string_storage_write('ERC721', 'name', name);
        long_string_storage_write('ERC721', 'symbol', symbol);
        self.bridge.write(bridge);
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

    #[external(v0)]
    impl ERC721BridgeableImpl of IERC721Bridgeable<ContractState> {
        fn mint_from_bridge(ref self: ContractState, to: ContractAddress, token_id: u256) {
            assert(
                starknet::get_caller_address() == self.bridge.read(),
                'ERC721: only bridge can mint'
            );

            mint(ref self, to, token_id);
        }

        fn mint_from_bridge_uri(ref self: ContractState, to: ContractAddress, token_id: u256, token_uri: LongString) {
            IERC721Bridgeable::mint_from_bridge(ref self, to, token_id);
            long_string_storage_write(token_id.low.into(), token_id.high.into(), token_uri);
        }
    }

    #[external(v0)]
    impl ERC721BridgeableUpgradeImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, class_hash: ClassHash) {
            assert(
                starknet::get_caller_address() == self.collection_owner.read(),
                'Unauthorized replace class'
            );

            match starknet::replace_class_syscall(class_hash) {
                Result::Ok(_) => (), // emit event
                Result::Err(revert_reason) => panic(revert_reason),
            };
        }
    }

    #[external(v0)]
    impl ERC721BridgeableERC721Impl of IERC721<ContractState> {
        //
        // *** VIEWS ***
        //
        fn name(self: @ContractState) -> LongString {
            long_string_storage_read('ERC721', 'name')
        }

        fn symbol(self: @ContractState) -> LongString {
            long_string_storage_read('ERC721', 'symbol')
        }

        fn owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
            get_owner_of(self, token_id)
        }

        fn is_approved_for_all(
            self: @ContractState, owner: ContractAddress, operator: ContractAddress
        ) -> bool {
            is_approved_for_all_check(self, owner, operator)
        }

        fn token_uri(self: @ContractState, token_id: u256) -> LongString {
            assert(exists(self, token_id), 'ERC721: invalid token ID');
            long_string_storage_read(token_id.low.into(), token_id.high.into())            
        }

        fn mint_free(ref self: ContractState, to: ContractAddress, token_id: u256) {
            mint(ref self, to, token_id);
        }

        fn mint_uri_free(ref self: ContractState, to: ContractAddress, token_id: u256, token_uri: LongString) {
            mint(ref self, to, token_id);
            long_string_storage_write(token_id.low.into(), token_id.high.into(), token_uri);
        }

        fn mint_range_free(ref self: ContractState, to: ContractAddress, start: u256, end: u256) {
            let mut token_id = start;
            loop {
                if token_id == end {
                    break ();
                }

                mint(ref self, to, token_id);                

                token_id += 1_u256;
            }
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

    use starklane::token::interfaces::{
        IERC721BridgeableDispatcher, IERC721BridgeableDispatcherTrait,
        IERC721Dispatcher, IERC721DispatcherTrait,
    };
    use starklane::token::collection_manager;

    use debug::PrintTrait;
    use serde::Serde;
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;
    use option::OptionTrait;
    use core::result::ResultTrait;
    use traits::{TryInto, Into};
    use starknet::contract_address::Felt252TryIntoContractAddress;
    use starknet::class_hash::Felt252TryIntoClassHash;
    use starknet::{ContractAddress, ClassHash};

    use starklane::string::{LongString, LongStringSerde};

    use snforge_std::{declare, deploy, PreparedContract, start_prank, stop_prank};

    /// Deploy a ERC721Bridgeable instance, reusable in tests.
    fn deploy_erc721b(
        name: LongString,
        symbol: LongString,
        bridge_addr: ContractAddress,
        collection_owner: ContractAddress,
    ) -> ContractAddress {
        let mut calldata: Array<felt252> = array![];
        name.serialize(ref calldata);
        symbol.serialize(ref calldata);
        calldata.append(bridge_addr.into());
        calldata.append(collection_owner.into());

        let class_hash = declare('erc721_bridgeable');
        let prepared = PreparedContract {
            class_hash: class_hash,
            constructor_calldata: @calldata
        };

        deploy(prepared).unwrap()
    }

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
        deploy_erc721b(
            'everai duo'.into(),
            'DUO'.into(),
            bridge_addr_mock(),
            collection_owner_addr_mock())
    }

    /// Should have correct constructor valules.
    #[test]
    #[available_gas(2000000000)]
    fn deploy_new() {
        let contract_address = deploy_everai_collection();
        let erc721 = IERC721Dispatcher { contract_address };

        let n = erc721.name();
        assert(n == 'everai duo'.into(), 'bad name');

        let s = erc721.symbol();
        assert(s == 'DUO'.into(), 'bad symbol');
    }

    /// Should store some LongString inside the storage.
    #[test]
    #[available_gas(2000000000)]
    fn storage_struct() {
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();
        let TOKEN_ID = 244;

        let contract_address = deploy_everai_collection();
        let erc721 = IERC721Dispatcher { contract_address };        

        let new_uri: LongString = 'https:...'.into();
        erc721.mint_uri_free(NEW_DUO_OWNER, TOKEN_ID, new_uri);

        let fetched_uri = erc721.token_uri(TOKEN_ID);
        assert(fetched_uri == new_uri, 'bad fetched uri');
    }

    /// Should mint token from bridge call.
    #[test]
    #[available_gas(2000000000)]
    fn mint_from_bridge() {
        let BRIDGE = bridge_addr_mock();
        let COLLECTION_OWNER = collection_owner_addr_mock();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();

        let contract_address = deploy_everai_collection();

        let erc721b = IERC721BridgeableDispatcher { contract_address };

        start_prank(contract_address, BRIDGE);
        erc721b.mint_from_bridge_uri(NEW_DUO_OWNER, 0, 'myuri'.into());
        stop_prank(contract_address);

        let erc721 = IERC721Dispatcher { contract_address };
        assert(erc721.owner_of(0) == NEW_DUO_OWNER, 'bad owner');
        assert(erc721.token_uri(0) == 'myuri'.into(), 'bad uri');
    }

    /// Should not mint token if not bridge.
    #[test]
    #[should_panic(expected: ('ERC721: only bridge can mint', ))]
    #[available_gas(2000000000)]
    fn should_panic_mint_from_bridge_fail() {
        let BRIDGE = bridge_addr_mock();
        let COLLECTION_OWNER = collection_owner_addr_mock();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();

        let contract_address = deploy_everai_collection();

        let erc721b = IERC721BridgeableDispatcher { contract_address };
        erc721b.mint_from_bridge_uri(NEW_DUO_OWNER, 0, 'myuri'.into());
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

        let contract_address = deploy_everai_collection();

        let erc721 = IERC721Dispatcher { contract_address };

        erc721.mint_free(FROM_DUO_OWNER, TOKEN_ID);
        assert(erc721.owner_of(TOKEN_ID) == FROM_DUO_OWNER, 'mint failed');

        start_prank(contract_address, FROM_DUO_OWNER);
        erc721.transfer_from(FROM_DUO_OWNER, TO_DUO_OWNER, TOKEN_ID);
        assert(erc721.owner_of(TOKEN_ID) == TO_DUO_OWNER, 'transfer failed');
    }

    /// Should get a token uri from contract call.
    /// This will try tokenURI and token_uri selectors.
    #[test]
    #[available_gas(2000000000)]
    fn token_uri_from_contract_call() {
        let BRIDGE = bridge_addr_mock();
        let COLLECTION_OWNER = collection_owner_addr_mock();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();
        let TOKEN_ID = 244;

        let contract_address = deploy_everai_collection();

        let erc721 = IERC721Dispatcher { contract_address };

        let new_uri: LongString = 'https:...'.into();
        erc721.mint_uri_free(NEW_DUO_OWNER, TOKEN_ID, new_uri);

        let fetched_uri = collection_manager::token_uri_from_contract_call(contract_address, TOKEN_ID)
            .expect('token mint failed');

        assert(fetched_uri == new_uri, 'bad uri');
    }
}
