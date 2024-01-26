#[cfg(test)]
mod tests {
    use snforge_std::cheatcodes::l1_handler::L1HandlerTrait;
    use core::traits::TryInto;
    use array::{ArrayTrait, SpanTrait};
    use traits::Into;
    use result::ResultTrait;
    use option::OptionTrait;
    use serde::Serde;
    use zeroable::Zeroable;
    use starknet::{ContractAddress, ClassHash, EthAddress};
    use starklane::{
        request::Request,
        interfaces::{IStarklaneDispatcher, IStarklaneDispatcherTrait},
    };
    use starklane::token::{
        interfaces::{
            IERC721Dispatcher, IERC721DispatcherTrait,
            IERC721BridgeableDispatcher, IERC721BridgeableDispatcherTrait
        },
    };

    use snforge_std::{declare, ContractClass, ContractClassTrait, start_prank, stop_prank, CheatTarget, L1Handler};

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

        let contract = declare('bridge');

        contract.deploy(@calldata).unwrap()
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
        name.serialize(ref calldata);
        symbol.serialize(ref calldata);
        calldata.append(bridge_addr.into());
        calldata.append(collection_owner.into());

        erc721b_contract_class.deploy(@calldata).unwrap()
    }

    #[test]
    fn deposit_token() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare('erc721_bridgeable');

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

        erc721.mint_range_free(COLLECTION_OWNER, 0, 10);

        let bridge = IStarklaneDispatcher { contract_address: bridge_address };

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

        assert!(erc721.owner_of(0) == bridge_address, "Wrong owner after deposit");

        // TODO: check for events when available.
    }

    #[test]
    fn withdraw_token() {
        // Need to declare here to get the class hash before deploy anything.
        let erc721b_contract_class = declare('erc721_bridgeable');

        let BRIDGE_ADMIN = starknet::contract_address_const::<'starklane'>();
        let BRIDGE_L1 = EthAddress { address: 'starklane_l1' };
        let OWNER_L1 = EthAddress { address: 'owner_l1' };
        let OWNER_L2 = starknet::contract_address_const::<'owner_l2'>();

        let bridge_address = deploy_starklane(BRIDGE_ADMIN, BRIDGE_L1, erc721b_contract_class.class_hash);

        let buf = array![
            0x0101, // hdr ERC721
            0x1, // hash
            0x0, // hash
            0xe0c, // collection_l1
            0x0, // collection_l2 0 => should trigger deploy.
            0xe00, // owner_l1
            OWNER_L2.into(), // owner_l2
            0, // name len
            'name', // name pending word
            4, // name pending word leng
            0, // symbol len
            'symbol', // symbol pending word
            6, // symbol pending word len
            0, // base_uri len
            'base_uri', // base_uri pending word
            8, // base_uri pending word len
            2, // ids len
            0, // id[0] low
            0, // id[0] high
            1, // id[0] low
            0, // id[0] high
            0, // values len
            0, // uris len
            0, // new_owners len
        ];

        
        let mut l1_handler = L1Handler {
            contract_address: bridge_address,
            // selector: 0x03593216f3a8b22f4cf375e5486e3d13bfde9d0f26976d20ac6f653c73f7e507,
            function_name: 'withdraw_auto_from_l1', 
            from_address: BRIDGE_L1.into(),
            payload: buf.span()
        };
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
    }

}
