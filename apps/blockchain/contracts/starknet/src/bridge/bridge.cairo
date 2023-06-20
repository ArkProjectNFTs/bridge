///! Bridge contract.
///!
///! The bridge contract is in charge to handle
///! the logic associated with bridge request from
///! a L1 message, or a deposit token from L2 transaction.

#[contract]
mod Bridge {
    use array::SpanTrait;
    use array::ArrayTrait;
    use traits::{Into, TryInto};
    use zeroable::Zeroable;
    use serde::Serde;

    use starknet::{ClassHash, ContractAddress};
    use starknet::contract_address::ContractAddressZeroable;

    use starklane::utils::serde::SpanSerde;
    use starklane::protocol::BridgeRequest;
    use starklane::protocol::deploy;
    use starklane::token::erc721::{
        TokenInfo,
        SpanTokenInfoSerde,
        IERC721BridgeableDispatcher,
        IERC721BridgeableDispatcherTrait};

    struct Storage {
        // Bridge administrator.
        _bridge_admin: ContractAddress,
        // The class to deploy for ERC721 tokens.
        _erc721_bridgeable_class: ClassHash,
        // Mapping between L2<->L1 collections addresses.
        // <collection_l2_address, collection_l1_address>
        _l2_to_l1_addresses: LegacyMap::<ContractAddress, felt252>,
        // Registry of escrowed token for collections.
        // <(collection_l2_address, token_id), original_depositor_l2_address>
        _escrow: LegacyMap::<(ContractAddress, u256), ContractAddress>,
    }

    #[constructor]
    fn constructor(bridge_admin: ContractAddress) {
        _bridge_admin::write(bridge_admin);
    }

    // *** EVENTS ***

    #[event]
    fn CollectionDeloyedFromL1(
        l1_addr: felt252,
        l2_addr: ContractAddress,
        name: felt252,
        symbol: felt252
    ) {}

    #[event]
    fn ReplacedClassHash(contract: ContractAddress, class: ClassHash) {}

    // *** VIEWS ***

    // TODO: add some views (admin and not admin) to see some states
    // for collections. For instance check if a collection is bridged,
    // what is it's L1 address, etc...
    //
    // For that -> maybe having a hash map l1<->l2 and l2<->l1 may be interesting?

    // *** EXTERNALS ***

    /// Simulates a message received from the L1.
    ///
    /// TODO: replace by the l1_handler. For that
    /// we must know exactly how deserialization works from l1_handler.
    #[external]
    fn on_l1_message(from: ContractAddress, req: BridgeRequest) {

        let collection_l2_address = ensure_collection_deployment(@req);
        let collection = IERC721BridgeableDispatcher { contract_address: collection_l2_address };

        let mut i = 0;
        loop {
            if i > req.tokens.len() {
                break ();
            }

            let token_id = *req.tokens[i].token_id;
            let to = req.owner_l2_address;
            let from = starknet::get_contract_address();

            if is_token_escrowed(collection_l2_address, token_id) {
                collection.permissioned_mint(to, token_id);
                // TODO: emit event.
            } else {
                collection.transfer_from(from, to, token_id);
                // TODO: emit event.
            }

            i += 1;
        };
    }

    /// Deploys the collection contract, if necessary.
    /// Returns the address of the collection on l2.
    ///
    /// * `req` - Request for bridging assets.
    fn ensure_collection_deployment(req: @BridgeRequest) -> ContractAddress {
        let l1_addr_from_mapping = _l2_to_l1_addresses::read(*req.collection_l2_address);

        if !l1_addr_from_mapping.is_zero() {
            // Collection already deployed, we only verify that the l1 addresses match.
            assert(l1_addr_from_mapping == *req.collection_l1_address, 'l1 addr mismatch');
            return *req.collection_l2_address;
        }

        // TODO: check if pedersen if strong enough here, or do we need poseidon?
        let salt = pedersen(*req.collection_l1_address, *req.owner_l1_address);

        let l2_addr_from_deploy = deploy::deploy_erc721_bridgeable(
            _erc721_bridgeable_class::read(),
            salt,
            *req.collection_name,
            *req.collection_symbol
        );

        _l2_to_l1_addresses::write(l2_addr_from_deploy, *req.collection_l1_address);

        CollectionDeloyedFromL1(
            *req.collection_l1_address,
            l2_addr_from_deploy,
            *req.collection_name,
            *req.collection_symbol);

        l2_addr_from_deploy
    }


    #[external]
    fn deposit_tokens(collection_l2_address: ContractAddress, tokens_ids: Span<u256>) {
        let from = starknet::get_caller_address();
        let to = starknet::get_contract_address();
        let collection = IERC721BridgeableDispatcher { contract_address: collection_l2_address };

        let mut i = 0;
        loop {
            if i > tokens_ids.len() {
                break ();
            }

            // TODO: Will revert on approval missing? Do we need to check
            // the approval explicitely?
            let token_id = *tokens_ids[i];
            collection.transfer_from(from, to, token_id);
            _escrow::write((collection_l2_address, token_id), from);

            i += 1;
        };

        let collection_l1_address = _l2_to_l1_addresses::read(collection_l2_address);

        // TODO: Send BridgeRequest to L1.
    }

    /// Sets the default class hash to be deployed when the
    /// first token of a collection is bridged.
    ///
    /// * `class_hash` - Class hash of the ERC721 to set as default.
    #[external]
    fn set_erc721_default_contract(class_hash: ClassHash) {
        ensure_is_admin();

        _erc721_bridgeable_class::write(class_hash);
    }

    #[external]
    fn replace_class(class_hash: ClassHash) {
        ensure_is_admin();

        match starknet::replace_class_syscall(class_hash) {
            Result::Ok(_) => ReplacedClassHash(starknet::get_contract_address(), class_hash),
            Result::Err(revert_reason) => panic(revert_reason),
        };
    }

    // *** INTERNALS ***

    /// Ensures the caller is the bridge admin. Revert if it's not.
    #[internal]
    fn ensure_is_admin() {
        assert(starknet::get_caller_address() == _bridge_admin::read(),
               'Unauthorized replace class');        
    }

    /// Returns true if the given token_id for the collection is present inside
    /// escrow storage, false otherwise.
    #[internal]
    fn is_token_escrowed(collection_address: ContractAddress, token_id: u256) -> bool {
        !_escrow::read((collection_address, token_id)).is_zero()
    }

}
