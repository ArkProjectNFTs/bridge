#[cfg(test)]
mod tests {
    use snforge_std::{
        cheatcodes::{
            events::EventFetcher, 
            events::EventAssertions,
            l1_handler::L1HandlerTrait
        },
        event_name_hash,
    };

    use core::traits::TryInto;
    use array::{ArrayTrait, SpanTrait};
    use traits::Into;
    use result::ResultTrait;
    use option::OptionTrait;
    use serde::Serde;
    use zeroable::Zeroable;

    use openzeppelin::access::ownable::interface::{
        IOwnableTwoStepDispatcher, IOwnableTwoStepDispatcherTrait
    };
    
    use starknet::{ContractAddress, ClassHash, EthAddress};
    use starklane::{
        request::{Request, compute_request_hash},
        interfaces::{IStarklaneDispatcher, IStarklaneDispatcherTrait, 
                    IUpgradeableDispatcher, IUpgradeableDispatcherTrait,
                    IStarklaneCollectionAdminDispatcher, IStarklaneCollectionAdminDispatcherTrait,
                    },
    };
    use starklane::token::{
        interfaces::{
            IERC721Dispatcher, IERC721DispatcherTrait,
            IERC721BridgeableDispatcher, IERC721BridgeableDispatcherTrait,
            IERC721MintableDispatcher, IERC721MintableDispatcherTrait,
        },
    };
    use starklane::bridge::bridge;

    use snforge_std::{declare, ContractClass, ContractClassTrait, start_prank, stop_prank, CheatTarget, L1Handler, get_class_hash, spy_events, SpyOn};

    #[derive(Drop)]
    struct BridgeDeployedConfig {
        admin: ContractAddress,
        bridge: ContractAddress,
        erc721: ContractAddress,
        erc721_class: ClassHash,
    }

    /// Deploys Starklane.
    fn deploy_starklane(
        bridge_admin: ContractAddress,
        bridge_l1_address: EthAddress,
        erc721_bridgeable_class: ClassHash,
    ) -> ContractAddress {
        let mut calldata: Array<felt252> = array![];
        calldata.append(bridge_admin.into());
        calldata.append(bridge_l1_address.into());
        calldata.append(erc721_bridgeable_class.into());

        let contract = declare("bridge");

        let bridge_address = contract.deploy(@calldata).unwrap();

        // enable bridge for tests
        start_prank(CheatTarget::One(bridge_address), bridge_admin);
        IStarklaneDispatcher { contract_address: bridge_address }.enable(true);
        stop_prank(CheatTarget::One(bridge_address));
        bridge_address
    }

    /// Deploy a ERC721Bridgeable instance, reusable in tests.
    fn deploy_erc721b(
        erc721b_contract_class: ContractClass,
        name: ByteArray,
        symbol: ByteArray,
        bridge_addr: ContractAddress,
        collection_owner: ContractAddress,
    ) -> ContractAddress {
        let mut calldata: Array<felt252> = array![];
        let base_uri: ByteArray = "https://my.base.uri/";
        name.serialize(ref calldata);
        symbol.serialize(ref calldata);
        base_uri.serialize(ref calldata);
        calldata.append(bridge_addr.into());
        calldata.append(collection_owner.into());

        erc721b_contract_class.deploy(@calldata).unwrap()
    }

    /// deploy bridge and ERC721Bridgeable
    fn deploy_bridge_and_create_collection(
        bridge_l1: EthAddress,
        collection_l1: EthAddress,
        owner_l1: EthAddress,
        owner_l2: ContractAddress,
        ids: Span<u256>,
    ) -> BridgeDeployedConfig {
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);

        let collection_l2: ContractAddress = 0x0.try_into().unwrap();

        let mut req = setup_request(
            collection_l1,
            collection_l2,
            owner_l1,
            owner_l2,
            "name",
            "symbol",
            "base_uri"
        );
        req.ids = ids;
        let mut buf = array![];
        req.serialize(ref buf);
        
        let mut l1_handler = L1Handler {
            contract_address: bridge_address,
            // selector: 0x03593216f3a8b22f4cf375e5486e3d13bfde9d0f26976d20ac6f653c73f7e507,
            function_selector: selector!("withdraw_auto_from_l1"), 
            from_address: bridge_l1.into(),
            payload: buf.span()
        };

        l1_handler.execute().unwrap();
        let bridge = IStarklaneDispatcher { contract_address: bridge_address };

        // Deserialize the request and check some expected values.
        let mut sp = buf.span();
        let req = Serde::<Request>::deserialize(ref sp).unwrap();

        let deployed_address = bridge.get_l2_collection_address(req.collection_l1.into());
        BridgeDeployedConfig {
            admin: BRIDGE_ADMIN,
            bridge: bridge_address,
            erc721: deployed_address,
            erc721_class: erc721b_contract_class.class_hash,
        }
    }

    fn mint_range(
        address: ContractAddress,
        collection_owner: ContractAddress,
        to: ContractAddress,
        start: u256,
        end: u256
    ) {
        let erc721 = IERC721MintableDispatcher { contract_address: address };
        start_prank(CheatTarget::One(address), collection_owner);
        erc721.mint_range(to, start, end);
        stop_prank(CheatTarget::One(address));
    }

    #[test]
    fn deposit_token() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let COLLECTION_OWNER = starknet::contract_address_const::<'collection owner'>();
        let OWNER_L1 = EthAddress { address: 'owner_l1' };

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);

        let erc721b_address = deploy_erc721b(
            erc721b_contract_class,
            "everai",
            "DUO",
            bridge_address,
            COLLECTION_OWNER
        );

        let erc721 = IERC721Dispatcher { contract_address: erc721b_address };

        mint_range(erc721b_address, COLLECTION_OWNER, COLLECTION_OWNER, 0, 10);

        let bridge = IStarklaneDispatcher { contract_address: bridge_address };

        start_prank(CheatTarget::One(erc721b_address), COLLECTION_OWNER);
        erc721.set_approval_for_all(bridge_address, true);
        stop_prank(CheatTarget::One(erc721b_address));

        let mut spy = spy_events(SpyOn::One(bridge_address));
        start_prank(CheatTarget::One(bridge_address), COLLECTION_OWNER);
        bridge.deposit_tokens(
            0x123,
            erc721b_address,
            OWNER_L1,
            array![0, 1].span(),
            false,
            false);
        stop_prank(CheatTarget::One(bridge_address));

        assert!(erc721.owner_of(0) == bridge_address, "Wrong owner after deposit");
        spy.fetch_events();
        assert_eq!(spy.events.len(), 1, "Only 1 event");
        let req_hash = compute_request_hash(0x123, erc721b_address, OWNER_L1, array![0, 1].span());
        let (from, event) = spy.events.at(0);
        assert!(from == @bridge_address, "Emitted from wrong address");
        assert_eq!(event.keys.len(), 4, "There should be four keys");
        assert!(event.keys.at(0) == @event_name_hash('DepositRequestInitiated'), "Wrong event name");
        assert_eq!(req_hash.low, (*event.keys.at(1)).try_into().unwrap(), "Wrong req hash");
        assert_eq!(req_hash.high, (*event.keys.at(2)).try_into().unwrap(), "Wrong req hash");
        let timestamp: u64 = (*event.keys.at(3)).try_into().unwrap();
        assert_eq!(timestamp, starknet::info::get_block_timestamp(), "Wrong timestamp key");

    }

    fn setup_request(collection_l1: EthAddress, 
            collection_l2: ContractAddress,
            owner_l1: EthAddress,
            owner_l2: ContractAddress,
            name: ByteArray,
            symbol: ByteArray,
            base_uri: ByteArray,
        ) -> Request {
                    
        let ids: Span<u256> = array![].span();
        let values: Span<u256> = array![].span();
        let uris: Span<ByteArray> = array![].span();
        let new_owners: Span<ContractAddress> = array![].span();

        Request {
            header: 0x101,
            hash: 0x1,
            collection_l1,
            collection_l2,
            owner_l1,
            owner_l2,
            name,
            symbol,
            base_uri,
            ids,
            values,
            uris,
            new_owners
        }
    }


    #[test]
    fn withdraw_token() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let OWNER_L2 = starknet::contract_address_const::<'owner_l2'>();

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);

        let collection_l1: EthAddress = 0xe0c.try_into().unwrap();
        let collection_l2: ContractAddress = 0x0.try_into().unwrap();
        let owner_l1: EthAddress = 0xe00.try_into().unwrap();
        let owner_l2: ContractAddress = OWNER_L2.into();
        let ids: Span<u256> = array![0_u256, 1_u256].span();

        let mut req = setup_request(
            collection_l1,
            collection_l2,
            owner_l1,
            owner_l2,
            "name",
            "symbol",
            "base_uri"
        );
        req.ids = ids;
        let mut buf = array![];
        req.serialize(ref buf);
        
        let mut l1_handler = L1Handler {
            contract_address: bridge_address,
            // selector: 0x03593216f3a8b22f4cf375e5486e3d13bfde9d0f26976d20ac6f653c73f7e507,
            function_selector: selector!("withdraw_auto_from_l1"), 
            from_address: BRIDGE_L1.into(),
            payload: buf.span()
        };
        let mut spy = spy_events(SpyOn::One(bridge_address));

        l1_handler.execute().unwrap();
        let bridge = IStarklaneDispatcher { contract_address: bridge_address };

        // Deserialize the request and check some expected values.
        let mut sp = buf.span();
        let req = Serde::<Request>::deserialize(ref sp).unwrap();

        let deployed_address = bridge.get_l2_collection_address(req.collection_l1.into());
        assert!(!deployed_address.is_zero(), "Expected deployed erc721");

        let erc721 = IERC721Dispatcher { contract_address: deployed_address };

        assert!(erc721.owner_of(0) == OWNER_L2, "Wrong owner after req");
        assert!(erc721.owner_of(1) == OWNER_L2, "Wrong owner after req");

        spy.assert_emitted(@array![
            (
                bridge_address,
                bridge::Event::WithdrawRequestCompleted(
                    bridge::WithdrawRequestCompleted {
                        hash: req.hash,
                        block_timestamp: starknet::info::get_block_timestamp(),
                        req_content: req,
                    }
                )

        )]);
    }

    #[test]
    fn withdraw_token_with_uri() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let OWNER_L2 = starknet::contract_address_const::<'owner_l2'>();

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);

        let collection_l1: EthAddress = 0xe0c.try_into().unwrap();
        let collection_l2: ContractAddress = 0x0.try_into().unwrap();
        let owner_l1: EthAddress = 0xe00.try_into().unwrap();
        let owner_l2: ContractAddress = OWNER_L2.into();
        let ids: Span<u256> = array![0_u256, 1_u256].span();
        let uris: Span<ByteArray> = array!["tokenA", "tokenB"].span();

        let mut req = setup_request(
            collection_l1,
            collection_l2,
            owner_l1,
            owner_l2,
            "name",
            "symbol",
            "base_uri"
        );
        req.ids = ids;
        req.uris = uris;
        let mut buf = array![];
        req.serialize(ref buf);
        
        let mut l1_handler = L1Handler {
            contract_address: bridge_address,
            // selector: 0x03593216f3a8b22f4cf375e5486e3d13bfde9d0f26976d20ac6f653c73f7e507,
            function_selector: selector!("withdraw_auto_from_l1"), 
            from_address: BRIDGE_L1.into(),
            payload: buf.span()
        };
        let mut spy = spy_events(SpyOn::One(bridge_address));

        l1_handler.execute().unwrap();
        let bridge = IStarklaneDispatcher { contract_address: bridge_address };

        // Deserialize the request and check some expected values.
        let mut sp = buf.span();
        let req = Serde::<Request>::deserialize(ref sp).unwrap();

        let deployed_address = bridge.get_l2_collection_address(req.collection_l1.into());
        assert!(!deployed_address.is_zero(), "Expected deployed erc721");

        let erc721 = IERC721Dispatcher { contract_address: deployed_address };

        assert!(erc721.owner_of(0) == OWNER_L2, "Wrong owner after req");
        assert!(erc721.owner_of(1) == OWNER_L2, "Wrong owner after req");
        
        assert!(erc721.token_uri(0) == "tokenA", "Wrong token uri");
        assert!(erc721.token_uri(1) == "tokenB", "Wrong token uri");

        spy.assert_emitted(@array![
            (
                bridge_address,
                bridge::Event::WithdrawRequestCompleted(
                    bridge::WithdrawRequestCompleted {
                        hash: req.hash,
                        block_timestamp: starknet::info::get_block_timestamp(),
                        req_content: req,
                    }
                )

        )]);
    }

    #[test]
    fn withdraw_token_with_mapping() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let COLLECTION_OWNER = starknet::contract_address_const::<'collection owner'>();
        let OWNER_L1 = EthAddress { address: 'owner_l1' };

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);

        let erc721b_address = deploy_erc721b(
            erc721b_contract_class,
            "everai",
            "DUO",
            bridge_address,
            COLLECTION_OWNER
        );

        let erc721 = IERC721Dispatcher { contract_address: erc721b_address };
        mint_range(erc721b_address, COLLECTION_OWNER, COLLECTION_OWNER, 0, 10);

        let bridge = IStarklaneDispatcher { contract_address: bridge_address };

        start_prank(CheatTarget::One(erc721b_address), COLLECTION_OWNER);
        erc721.set_approval_for_all(bridge_address, true);
        stop_prank(CheatTarget::One(erc721b_address));
        
        let mut spy = spy_events(SpyOn::One(bridge_address));
        start_prank(CheatTarget::One(bridge_address), COLLECTION_OWNER);
        bridge.deposit_tokens(
            0x123,
            erc721b_address,
            OWNER_L1,
            array![0, 1].span(),
            false,
            false);
        stop_prank(CheatTarget::One(bridge_address));

        let owner_l2 = starknet::contract_address_const::<'owner_l2'>();
        let collection_l1 = EthAddress { address: 0x4269};

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.set_l1_l2_collection_mapping(collection_l1, erc721b_address);
        stop_prank(CheatTarget::One(bridge_address));

        spy.fetch_events();
        let (_, event) = spy.events.at(0);
        let mut req_content = event.data.span();
        let mut req = Serde::<Request>::deserialize(ref req_content).unwrap();
        req.owner_l2 = owner_l2;
        req.collection_l1 = collection_l1;
        req.collection_l2 = erc721b_address;
        let mut buf = array![];
        req.serialize(ref buf);

        let mut l1_handler = L1Handler {
            contract_address: bridge_address,
            // selector: 0x03593216f3a8b22f4cf375e5486e3d13bfde9d0f26976d20ac6f653c73f7e507,
            function_selector: selector!("withdraw_auto_from_l1"), 
            from_address: BRIDGE_L1.into(),
            payload: buf.span()
        };
        
        l1_handler.execute().unwrap();

        assert!(erc721.owner_of(0) == owner_l2, "Wrong owner");
    }

    #[test]
    fn withdraw_token_created_collection_shall_be_whitelisted() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let OWNER_L2 = starknet::contract_address_const::<'owner_l2'>();

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);

        let collection_l1: EthAddress = 0xe0c.try_into().unwrap();
        let collection_l2: ContractAddress = 0x0.try_into().unwrap();
        let owner_l1: EthAddress = 0xe00.try_into().unwrap();
        let owner_l2: ContractAddress = OWNER_L2.into();
        let ids: Span<u256> = array![0_u256, 1_u256].span();

        let mut req = setup_request(
            collection_l1,
            collection_l2,
            owner_l1,
            owner_l2,
            "name",
            "symbol",
            "base_uri"
        );
        req.ids = ids;
        let mut buf = array![];
        req.serialize(ref buf);

        let bridge = IStarklaneDispatcher { contract_address: bridge_address };
        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.enable_white_list(true);
        stop_prank(CheatTarget::One(bridge_address));

        let mut l1_handler = L1Handler {
            contract_address: bridge_address,
            // selector: 0x03593216f3a8b22f4cf375e5486e3d13bfde9d0f26976d20ac6f653c73f7e507,
            function_selector: selector!("withdraw_auto_from_l1"), 
            from_address: BRIDGE_L1.into(),
            payload: buf.span()
        };

        l1_handler.execute().unwrap();

        // Deserialize the request and check some expected values.
        let mut sp = buf.span();
        let req = Serde::<Request>::deserialize(ref sp).unwrap();

        let deployed_address = bridge.get_l2_collection_address(req.collection_l1.into());
        assert!(!deployed_address.is_zero(), "Expected deployed erc721");

        let erc721 = IERC721Dispatcher { contract_address: deployed_address };

        assert!(erc721.owner_of(0) == OWNER_L2, "Wrong owner after req");
        assert!(erc721.owner_of(1) == OWNER_L2, "Wrong owner after req");

        assert!(bridge.is_white_listed(deployed_address), "Collection shall be whitelisted");
        let white_listed = bridge.get_white_listed_collections();
        assert_eq!(*white_listed.at(0), deployed_address, "Collection whitelisted shall be in list");
    }

    #[test]
    #[should_panic]
    fn deposit_token_not_whitelisted() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let COLLECTION_OWNER = starknet::contract_address_const::<'collection owner'>();
        let OWNER_L1 = EthAddress { address: 'owner_l1' };

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);

        let erc721b_address = deploy_erc721b(
            erc721b_contract_class,
            "everai",
            "DUO",
            bridge_address,
            COLLECTION_OWNER
        );

        let erc721 = IERC721Dispatcher { contract_address: erc721b_address };

        mint_range(erc721b_address, COLLECTION_OWNER, COLLECTION_OWNER, 0, 10);

        let bridge = IStarklaneDispatcher { contract_address: bridge_address };
        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.enable_white_list(true);
        stop_prank(CheatTarget::One(bridge_address));

        start_prank(CheatTarget::One(erc721b_address), COLLECTION_OWNER);
        erc721.set_approval_for_all(bridge_address, true);
        stop_prank(CheatTarget::One(erc721b_address));

        start_prank(CheatTarget::One(bridge_address), COLLECTION_OWNER);
        bridge.deposit_tokens(
            0x123,
            erc721b_address,
            OWNER_L1,
            array![0, 1].span(),
            false,
            false);
        stop_prank(CheatTarget::One(bridge_address));
    }

    #[test]
    fn deposit_token_whitelisted() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let COLLECTION_OWNER = starknet::contract_address_const::<'collection owner'>();
        let OWNER_L1 = EthAddress { address: 'owner_l1' };

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);

        let erc721b_address = deploy_erc721b(
            erc721b_contract_class,
            "everai",
            "DUO",
            bridge_address,
            COLLECTION_OWNER
        );

        let erc721 = IERC721Dispatcher { contract_address: erc721b_address };

        mint_range(erc721b_address, COLLECTION_OWNER, COLLECTION_OWNER, 0, 10);

        let bridge = IStarklaneDispatcher { contract_address: bridge_address };
        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.enable_white_list(true);
        bridge.white_list_collection(erc721b_address, true);
        stop_prank(CheatTarget::One(bridge_address));

        start_prank(CheatTarget::One(erc721b_address), COLLECTION_OWNER);
        erc721.set_approval_for_all(bridge_address, true);
        stop_prank(CheatTarget::One(erc721b_address));

        start_prank(CheatTarget::One(bridge_address), COLLECTION_OWNER);
        bridge.deposit_tokens(
            0x123,
            erc721b_address,
            OWNER_L1,
            array![0, 1].span(),
            false,
            false);
        stop_prank(CheatTarget::One(bridge_address));
    }

    #[test]
    fn whitelist_collection_is_empty_by_default() {
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);
        let bridge = IStarklaneDispatcher { contract_address: bridge_address };
        
        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.enable_white_list(true);
        stop_prank(CheatTarget::One(bridge_address));
        assert!(bridge.get_white_listed_collections().is_empty(), "White list shall be empty by default");        
    }

    #[test]
    fn whitelist_collection_is_updated_when_collection_is_added() {
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);
        let bridge = IStarklaneDispatcher { contract_address: bridge_address };
        
        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.enable_white_list(true);
        stop_prank(CheatTarget::One(bridge_address));
        
        let collection1 = starknet::contract_address_const::<'collection1'>();
        let collection2 = starknet::contract_address_const::<'collection2'>();
        let collection3 = starknet::contract_address_const::<'collection3'>();

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.white_list_collection(collection1, true);
        stop_prank(CheatTarget::One(bridge_address));
        
        let white_listed = bridge.get_white_listed_collections();
        assert_eq!(white_listed.len(), 1, "White list shall contain 1 element");
        assert_eq!(*white_listed.at(0), collection1, "Wrong collection address in white list");

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.white_list_collection(collection2, true);
        bridge.white_list_collection(collection3, true);
        stop_prank(CheatTarget::One(bridge_address));

        let white_listed = bridge.get_white_listed_collections();
        assert_eq!(white_listed.len(), 3, "White list shall contain 3 elements");
        assert_eq!(*white_listed.at(0), collection1, "Wrong collection address in white list");
        assert_eq!(*white_listed.at(1), collection2, "Wrong collection address in white list");
        assert_eq!(*white_listed.at(2), collection3, "Wrong collection address in white list");
        assert!(bridge.is_white_listed(collection1), "Collection1 should be whitelisted");
        assert!(bridge.is_white_listed(collection2), "Collection1 should be whitelisted");
        assert!(bridge.is_white_listed(collection3), "Collection1 should be whitelisted");

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.white_list_collection(collection2, true);
        stop_prank(CheatTarget::One(bridge_address));

        let white_listed = bridge.get_white_listed_collections();
        assert_eq!(white_listed.len(), 3, "White list shall contain 3 elements");
        assert_eq!(*white_listed.at(0), collection1, "Wrong collection address in white list");
        assert_eq!(*white_listed.at(1), collection2, "Wrong collection address in white list");
        assert_eq!(*white_listed.at(2), collection3, "Wrong collection address in white list");
        assert!(bridge.is_white_listed(collection1), "Collection1 should be whitelisted");
        assert!(bridge.is_white_listed(collection2), "Collection1 should be whitelisted");
        assert!(bridge.is_white_listed(collection3), "Collection1 should be whitelisted");
    }

    #[test]
    fn whitelist_collection_is_updated_when_collection_is_removed() {
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);
        let bridge = IStarklaneDispatcher { contract_address: bridge_address };
        
        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.enable_white_list(true);
        stop_prank(CheatTarget::One(bridge_address));
        
        let collection1 = starknet::contract_address_const::<'collection1'>();
        let collection2 = starknet::contract_address_const::<'collection2'>();
        let collection3 = starknet::contract_address_const::<'collection3'>();

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.white_list_collection(collection1, true);
        bridge.white_list_collection(collection2, true);
        bridge.white_list_collection(collection3, true);
        stop_prank(CheatTarget::One(bridge_address));
        
        let white_listed = bridge.get_white_listed_collections();
        assert_eq!(white_listed.len(), 3, "White list shall contain 3 elements");
        assert_eq!(*white_listed.at(0), collection1, "Wrong collection address in white list");
        assert_eq!(*white_listed.at(1), collection2, "Wrong collection address in white list");
        assert_eq!(*white_listed.at(2), collection3, "Wrong collection address in white list");
        assert!(bridge.is_white_listed(collection1), "Collection1 should be whitelisted");
        assert!(bridge.is_white_listed(collection2), "Collection1 should be whitelisted");
        assert!(bridge.is_white_listed(collection3), "Collection1 should be whitelisted");

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.white_list_collection(collection2, false);
        stop_prank(CheatTarget::One(bridge_address));
        let white_listed = bridge.get_white_listed_collections();
        assert_eq!(white_listed.len(), 2, "White list shall contain 2 elements");
        assert_eq!(*white_listed.at(0), collection1, "Wrong collection address in white list");
        assert_eq!(*white_listed.at(1), collection3, "Wrong collection address in white list");
        assert!(bridge.is_white_listed(collection1), "Collection1 should be whitelisted");
        assert!(!bridge.is_white_listed(collection2), "Collection1 should not be whitelisted");
        assert!(bridge.is_white_listed(collection3), "Collection1 should be whitelisted");

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.white_list_collection(collection1, false);
        bridge.white_list_collection(collection3, false);
        stop_prank(CheatTarget::One(bridge_address));
        let white_listed = bridge.get_white_listed_collections();
        assert!(white_listed.is_empty(), "White list shall be empty");
        assert!(!bridge.is_white_listed(collection1), "Collection1 should not be whitelisted");
        assert!(!bridge.is_white_listed(collection2), "Collection1 should not be whitelisted");
        assert!(!bridge.is_white_listed(collection3), "Collection1 should not be whitelisted");

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.white_list_collection(collection1, true);
        bridge.white_list_collection(collection3, true);
        stop_prank(CheatTarget::One(bridge_address));
        
        let white_listed = bridge.get_white_listed_collections();
        assert_eq!(white_listed.len(), 2, "White list shall contain 2 elements");
        assert_eq!(*white_listed.at(0), collection1, "Wrong collection address in white list");
        assert_eq!(*white_listed.at(1), collection3, "Wrong collection address in white list");
        assert!(bridge.is_white_listed(collection1), "Collection1 should be whitelisted");
        assert!(!bridge.is_white_listed(collection2), "Collection1 should not be whitelisted");
        assert!(bridge.is_white_listed(collection3), "Collection1 should be whitelisted");

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.white_list_collection(collection1, false);
        bridge.white_list_collection(collection2, true);
        stop_prank(CheatTarget::One(bridge_address));
        
        let white_listed = bridge.get_white_listed_collections();
        assert_eq!(white_listed.len(), 2, "White list shall contain 2 elements");
        assert_eq!(*white_listed.at(0), collection3, "Wrong collection address in white list");
        assert_eq!(*white_listed.at(1), collection2, "Wrong collection address in white list");
        assert!(!bridge.is_white_listed(collection1), "Collection1 should not be whitelisted");
        assert!(bridge.is_white_listed(collection2), "Collection1 should be whitelisted");
        assert!(bridge.is_white_listed(collection3), "Collection1 should be whitelisted");

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.white_list_collection(collection2, false);
        bridge.white_list_collection(collection3, false);
        bridge.white_list_collection(collection1, false);
        bridge.white_list_collection(collection1, false);
        stop_prank(CheatTarget::One(bridge_address));
        
        let white_listed = bridge.get_white_listed_collections();
        assert!(white_listed.is_empty(), "White list shall be empty");
        assert!(!bridge.is_white_listed(collection1), "Collection1 should not be whitelisted");
        assert!(!bridge.is_white_listed(collection2), "Collection1 should not be whitelisted");
        assert!(!bridge.is_white_listed(collection3), "Collection1 should not be whitelisted");
    }

    #[test]
    fn whitelist_collection_update_events() {
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);
        let bridge = IStarklaneDispatcher { contract_address: bridge_address };
        
        let collection1 = starknet::contract_address_const::<'collection1'>();
        let collection2 = starknet::contract_address_const::<'collection2'>();
        let collection3 = starknet::contract_address_const::<'collection3'>();
        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.enable_white_list(true);
        stop_prank(CheatTarget::One(bridge_address));

        let mut spy = spy_events(SpyOn::One(bridge_address));
        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.white_list_collection(collection1, true);
        stop_prank(CheatTarget::One(bridge_address));
        spy.assert_emitted(@array![
            (
                bridge_address,
                bridge::Event::CollectionWhiteListUpdated(
                    bridge::CollectionWhiteListUpdated {
                        collection: collection1,
                        enabled: true,
                    }
                )
            )
        ]);

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.white_list_collection(collection2, true);
        bridge.white_list_collection(collection1, false);
        stop_prank(CheatTarget::One(bridge_address));
        spy.assert_emitted(@array![
            (
                bridge_address,
                bridge::Event::CollectionWhiteListUpdated(
                    bridge::CollectionWhiteListUpdated {
                        collection: collection2,
                        enabled: true,
                    }
                )
            ),
            (
                bridge_address,
                bridge::Event::CollectionWhiteListUpdated(
                    bridge::CollectionWhiteListUpdated {
                        collection: collection1,
                        enabled: false,
                    }
                )
            )
        ]);

    }

    #[test]
    #[should_panic]
    fn deposit_token_not_enabled() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let COLLECTION_OWNER = starknet::contract_address_const::<'collection owner'>();
        let OWNER_L1 = EthAddress { address: 'owner_l1' };

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);

        let erc721b_address = deploy_erc721b(
            erc721b_contract_class,
            "everai",
            "DUO",
            bridge_address,
            COLLECTION_OWNER
        );

        mint_range(erc721b_address, COLLECTION_OWNER, COLLECTION_OWNER, 0, 10);

        let bridge = IStarklaneDispatcher { contract_address: bridge_address };
        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.enable(false);
        stop_prank(CheatTarget::One(bridge_address));


        start_prank(CheatTarget::One(bridge_address), COLLECTION_OWNER);
        bridge.deposit_tokens(
            0x123,
            erc721b_address,
            OWNER_L1,
            array![0, 1].span(),
            false,
            false);
        stop_prank(CheatTarget::One(bridge_address));
    }

    #[test]
    fn test_enable() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);
        let bridge = IStarklaneDispatcher { contract_address: bridge_address};
        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        bridge.enable(true);
        assert!(bridge.is_enabled());
        bridge.enable(false);
        assert!(!bridge.is_enabled());
        stop_prank(CheatTarget::One(bridge_address));  
    }

    #[test]
    #[should_panic]
    fn test_enable_as_not_admin() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let alice = starknet::contract_address_const::<'alice'>();

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);
        start_prank(CheatTarget::One(bridge_address), alice);
        IStarklaneDispatcher { contract_address: bridge_address }.enable(true);
        stop_prank(CheatTarget::One(bridge_address));        
    }

    #[test]
    fn upgrade_as_admin() {
       let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);

        let mut spy = spy_events(SpyOn::One(bridge_address));

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        IUpgradeableDispatcher { contract_address: bridge_address}.upgrade(erc721b_contract_class.class_hash);
        stop_prank(CheatTarget::One(bridge_address));
        assert!(get_class_hash(bridge_address) == erc721b_contract_class.class_hash, "Incorrect class hash upgrade");
        
        spy.assert_emitted(@array![
            (
                bridge_address,
                bridge::Event::ReplacedClassHash(
                    bridge::ReplacedClassHash {
                        contract: bridge_address,
                        class: erc721b_contract_class.class_hash,
                    }
                )
            )
        ]);
        assert(spy.events.len() == 0, 'There should be no events');
    }

    #[test]
    #[should_panic(expected: ('Caller is not the owner',))]
    fn upgrade_as_not_admin() {
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);
        let bridge = IUpgradeableDispatcher { contract_address: bridge_address };
        let alice = starknet::contract_address_const::<'alice'>();

        start_prank(CheatTarget::One(bridge_address), alice);
        bridge.upgrade(erc721b_contract_class.class_hash);
        stop_prank(CheatTarget::One(bridge_address));        
    }

    #[test]
    fn support_two_step_transfer_ownership() {
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let ALICE = starknet::contract_address_const::<'alice'>();
        let contract_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);
        let ownable = IOwnableTwoStepDispatcher { contract_address};

        assert_eq!(ownable.owner(), BRIDGE_ADMIN, "bad owner");
        start_prank(CheatTarget::One(contract_address), BRIDGE_ADMIN);
        ownable.transfer_ownership(ALICE);
        stop_prank(CheatTarget::One(contract_address));
        assert_eq!(ownable.owner(), BRIDGE_ADMIN, "bad owner");
        assert_eq!(ownable.pending_owner(), ALICE, "bad pending owner");

        start_prank(CheatTarget::One(contract_address), ALICE);
        ownable.accept_ownership();
        stop_prank(CheatTarget::One(contract_address));
        assert_eq!(ownable.owner(), ALICE, "bad owner");
    }

    #[test]
    #[should_panic(expected: ('Caller is not the owner',))]
    fn should_panic_transfer_not_owner() {
        let erc721b_contract_class = declare("erc721_bridgeable");

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let ALICE = starknet::contract_address_const::<'alice'>();
        let contract_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);
        let ownable = IOwnableTwoStepDispatcher { contract_address};

        assert_eq!(ownable.owner(), BRIDGE_ADMIN, "bad owner");
        start_prank(CheatTarget::One(contract_address), ALICE);
        ownable.transfer_ownership(ALICE);
        stop_prank(CheatTarget::One(contract_address));
    }

    #[test]
    fn collection_upgrade_as_admin() {
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let OWNER_L1: EthAddress = 0xe00.try_into().unwrap();
        let OWNER_L2 = starknet::contract_address_const::<'owner_l2'>();
        let COLLECTION_L1: EthAddress = 0xe0c.try_into().unwrap();
        let ids: Span<u256> = array![0_u256, 1_u256].span();

        let bridge_deployed_config = deploy_bridge_and_create_collection(BRIDGE_L1, 
            COLLECTION_L1, 
            OWNER_L1, 
            OWNER_L2, 
            ids);
        let BRIDGE_ADMIN = bridge_deployed_config.admin;
        let bridge_address = bridge_deployed_config.bridge;
        let erc721b_class = bridge_deployed_config.erc721_class;

        let bridge = IStarklaneDispatcher { contract_address: bridge_address };

        let deployed_address = bridge.get_l2_collection_address(COLLECTION_L1.into());
        assert!(!deployed_address.is_zero(), "Expected deployed erc721");
        assert!(get_class_hash(deployed_address) == erc721b_class, "Expected class hash");

        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        IStarklaneCollectionAdminDispatcher { contract_address: bridge_address}.collection_upgrade(deployed_address, get_class_hash(bridge_address));
        stop_prank(CheatTarget::One(bridge_address));
        assert!(get_class_hash(deployed_address) == get_class_hash(bridge_address), "Class hash not updated");
    }


    #[test]
    fn collection_transfer_ownership_as_admin() {
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let OWNER_L1: EthAddress = 0xe00.try_into().unwrap();
        let OWNER_L2 = starknet::contract_address_const::<'owner_l2'>();
        let COLLECTION_L1: EthAddress = 0xe0c.try_into().unwrap();
        let ids: Span<u256> = array![0_u256, 1_u256].span();

        let bridge_deployed_config = deploy_bridge_and_create_collection(BRIDGE_L1, 
            COLLECTION_L1, 
            OWNER_L1, 
            OWNER_L2, 
            ids);
        let BRIDGE_ADMIN = bridge_deployed_config.admin;
        let bridge_address = bridge_deployed_config.bridge;
        let erc721b = bridge_deployed_config.erc721;

        let ownable = IOwnableTwoStepDispatcher { contract_address: erc721b };
        assert_eq!(ownable.owner(), bridge_address, "Wrong owner");

        let ALICE = starknet::contract_address_const::<'alice'>();
        
        start_prank(CheatTarget::One(bridge_address), BRIDGE_ADMIN);
        IStarklaneCollectionAdminDispatcher { contract_address: bridge_address}.collection_transfer_ownership(erc721b, ALICE);
        stop_prank(CheatTarget::One(bridge_address));

        assert_eq!(ownable.owner(), bridge_address, "Wrong owner");
        assert_eq!(ownable.pending_owner(), ALICE, "Wrong pending owner");

        start_prank(CheatTarget::One(erc721b), ALICE);
        ownable.accept_ownership();
        stop_prank(CheatTarget::One(erc721b));
        assert_eq!(ownable.owner(), ALICE, "Wrong owner");
    }

    #[test]
    #[should_panic(expected: ('Caller is not the owner',))]
    fn collection_transfer_ownership_as_not_admin() {
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let OWNER_L1: EthAddress = 0xe00.try_into().unwrap();
        let OWNER_L2 = starknet::contract_address_const::<'owner_l2'>();
        let COLLECTION_L1: EthAddress = 0xe0c.try_into().unwrap();
        let ids: Span<u256> = array![0_u256, 1_u256].span();

        let bridge_deployed_config = deploy_bridge_and_create_collection(BRIDGE_L1, 
            COLLECTION_L1, 
            OWNER_L1, 
            OWNER_L2, 
            ids);
        let bridge_address = bridge_deployed_config.bridge;
        let erc721b = bridge_deployed_config.erc721;


        let ALICE = starknet::contract_address_const::<'alice'>();
        
        start_prank(CheatTarget::One(bridge_address), OWNER_L2);
        IStarklaneCollectionAdminDispatcher { contract_address: bridge_address}.collection_transfer_ownership(erc721b, ALICE);
        stop_prank(CheatTarget::One(bridge_address));
    }
    
}
