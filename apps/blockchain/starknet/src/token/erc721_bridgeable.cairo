///! ERC721 that can be controlled by the bridge.
///!

#[starknet::contract]
mod erc721_bridgeable {
    use starknet::{ContractAddress, ClassHash};

    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc721::ERC721Component;

    use starklane::token::interfaces::{IERC721Bridgeable, IERC721Mintable};
    use starklane::interfaces::IUpgradeable;

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // ERC721Mixin can't be used since we have a custom implementation for Metadata
    #[abi(embed_v0)]
    impl ERC721Impl = ERC721Component::ERC721Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC721CamelOnly = ERC721Component::ERC721CamelOnlyImpl<ContractState>;
    
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    // SRC5
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    #[storage]
    struct Storage {
        bridge: ContractAddress,
        collection_owner: ContractAddress,
        /// token_uris is required if we want uris not derivated from base_uri
        token_uris: LegacyMap<u256, ByteArray>,
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        base_uri: ByteArray,
        bridge: ContractAddress,
        collection_owner: ContractAddress,
    ) {
        assert(!bridge.is_zero(), 'Invalid bridge address');
        assert(!collection_owner.is_zero(), 'Bad collection owner address');

        self.erc721.initializer(name, symbol, base_uri);
        self.bridge.write(bridge);
        self.collection_owner.write(collection_owner);
    }


    #[abi(embed_v0)]
    impl ERC721BridgeableImpl of IERC721Bridgeable<ContractState> {
        fn mint_from_bridge(ref self: ContractState, to: ContractAddress, token_id: u256) {
            assert(
                starknet::get_caller_address() == self.bridge.read(),
                'ERC721: only bridge can mint'
            );

            self.erc721._mint(to, token_id);
        }

        fn mint_from_bridge_uri(ref self: ContractState, to: ContractAddress, token_id: u256, token_uri: ByteArray) {
            IERC721Bridgeable::mint_from_bridge(ref self, to, token_id);
            self.token_uris.write(token_id, token_uri);
        }
    }

    #[abi(embed_v0)]
    impl ERC721BridgeableMetadataImpl of ERC721Component::interface::IERC721Metadata<ContractState> {
        fn name(self: @ContractState) -> ByteArray {
            self.erc721.name()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.erc721.symbol()
        }

        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            let uri = self.token_uris.read(token_id);
            if uri != Default::default() {
                uri
            } else {
                self.erc721.token_uri(token_id)
            }
        }
    }

    #[abi(embed_v0)]
    impl ERC721BridgeableMetadataCamelOnlyImpl of ERC721Component::interface::IERC721MetadataCamelOnly<ContractState> {
        fn tokenURI(self: @ContractState, tokenId: u256) -> ByteArray {
            self.token_uri(tokenId)
        }
    }

    #[abi(embed_v0)]
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

    #[abi(embed_v0)]
    impl ERC721BridgeableMintableImpl of IERC721Mintable<ContractState> {
        fn mint(ref self: ContractState, to: ContractAddress, token_id: u256) {
            assert(
                starknet::get_caller_address() == self.collection_owner.read(),
                'ERC721: only col owner can mint'
            );
            self.erc721._mint(to, token_id);
        }

        fn mint_range(ref self: ContractState, to: ContractAddress, start: u256, end: u256) {
            let mut token_id = start;
            loop {
                    if token_id == end {
                        break ();
                    }
                self.mint(to, token_id);
                token_id += 1_u256;
            }
        }

        fn mint_uri(ref self: ContractState, to: ContractAddress, token_id: u256, token_uri: ByteArray) {
            self.mint(to, token_id);
            self.token_uris.write(token_id, token_uri);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::erc721_bridgeable;

    use starklane::token::interfaces::{
        IERC721BridgeableDispatcher, IERC721BridgeableDispatcherTrait,
        IERC721Dispatcher, IERC721DispatcherTrait,
        IERC721MintableDispatcher, IERC721MintableDispatcherTrait,
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


    use snforge_std::{declare, ContractClassTrait, start_prank, stop_prank, CheatTarget};

    /// Deploy a ERC721Bridgeable instance, reusable in tests.
    fn deploy_erc721b(
        name: ByteArray,
        symbol: ByteArray,
        base_uri: ByteArray,
        bridge_addr: ContractAddress,
        collection_owner: ContractAddress,
    ) -> ContractAddress {
        let mut calldata: Array<felt252> = array![];
        name.serialize(ref calldata);
        symbol.serialize(ref calldata);
        base_uri.serialize(ref calldata);
        calldata.append(bridge_addr.into());
        calldata.append(collection_owner.into());

        let contract = declare("erc721_bridgeable");

        contract.deploy(@calldata).unwrap()
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
            "everai duo",
            "DUO",
            "https://my.base.uri",
            bridge_addr_mock(),
            collection_owner_addr_mock())
    }

    /// Should have correct constructor valules.
    #[test]
    fn deploy_new() {
        let contract_address = deploy_everai_collection();
        let erc721 = IERC721Dispatcher { contract_address };

        let n = erc721.name();
        assert_eq!(n, "everai duo", "bad name");

        let s = erc721.symbol();
        assert_eq!(s, "DUO", "bad symbol");
    }

    /// Should store some LongString inside the storage.
    #[test]
    fn storage_struct() {
        let COLLECTION_OWNER = collection_owner_addr_mock();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();
        let TOKEN_ID = 244;

        let contract_address = deploy_everai_collection();
        let erc721 = IERC721Dispatcher { contract_address };        
        
        let new_uri = "https:...";
        start_prank(CheatTarget::One(contract_address), COLLECTION_OWNER);
        IERC721MintableDispatcher { contract_address }.mint_uri(NEW_DUO_OWNER, TOKEN_ID, new_uri.clone());
        stop_prank(CheatTarget::One(contract_address));

        let fetched_uri = erc721.token_uri(TOKEN_ID);
        assert_eq!(fetched_uri, new_uri, "bad fetched uri");
    }

    /// Should mint token from bridge call.
    #[test]
    fn mint_from_bridge() {
        let BRIDGE = bridge_addr_mock();
        
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();

        let contract_address = deploy_everai_collection();

        let erc721b = IERC721BridgeableDispatcher { contract_address };

        start_prank(CheatTarget::One(contract_address), BRIDGE);
        erc721b.mint_from_bridge_uri(NEW_DUO_OWNER, 0, "myuri");
        stop_prank(CheatTarget::One(contract_address));

        let erc721 = IERC721Dispatcher { contract_address };
        assert!(erc721.owner_of(0) == NEW_DUO_OWNER, "bad owner");
        assert_eq!(erc721.token_uri(0), "myuri", "bad uri");
    }

    /// Should not mint token if not bridge.
    #[test]
    #[should_panic(expected: ('ERC721: only bridge can mint', ))]
    fn should_panic_mint_from_bridge_fail() {
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();

        let contract_address = deploy_everai_collection();

        let erc721b = IERC721BridgeableDispatcher { contract_address };
        erc721b.mint_from_bridge_uri(NEW_DUO_OWNER, 0, "myuri");
    }

    /// Should transfer tokens.
    #[test]
    fn transfer_tokens() {
        let COLLECTION_OWNER = collection_owner_addr_mock();
        let FROM_DUO_OWNER = starknet::contract_address_const::<128>();
        let TO_DUO_OWNER = starknet::contract_address_const::<128>();
        let TOKEN_ID = 0_u256;

        let contract_address = deploy_everai_collection();

        let erc721 = IERC721Dispatcher { contract_address };

        start_prank(CheatTarget::One(contract_address), COLLECTION_OWNER);
        IERC721MintableDispatcher { contract_address }.mint(FROM_DUO_OWNER, TOKEN_ID);
        stop_prank(CheatTarget::One(contract_address));

        assert!(erc721.owner_of(TOKEN_ID) == FROM_DUO_OWNER, "mint failed");

        start_prank(CheatTarget::One(contract_address), FROM_DUO_OWNER);
        erc721.transfer_from(FROM_DUO_OWNER, TO_DUO_OWNER, TOKEN_ID);
        assert!(erc721.owner_of(TOKEN_ID) == TO_DUO_OWNER, "transfer failed");
    }

    /// Should get a token uri from contract call.
    /// This will try tokenURI and token_uri selectors.
    #[test]
    fn token_uri_from_contract_call() {
        let COLLECTION_OWNER = collection_owner_addr_mock();
        let NEW_DUO_OWNER = starknet::contract_address_const::<128>();
        let TOKEN_ID = 244;

        let contract_address = deploy_everai_collection();

        let erc721 = IERC721MintableDispatcher { contract_address };

        let new_uri = "https:...";
        start_prank(CheatTarget::One(contract_address), COLLECTION_OWNER);
        erc721.mint_uri(NEW_DUO_OWNER, TOKEN_ID, new_uri.clone());
        stop_prank(CheatTarget::One(contract_address));

        let fetched_uri = collection_manager::token_uri_from_contract_call(contract_address, TOKEN_ID)
            .expect('token mint failed');
        assert_eq!(fetched_uri, new_uri, "bad uri");
    }
}
