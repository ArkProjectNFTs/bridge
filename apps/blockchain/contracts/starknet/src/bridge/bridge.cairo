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
    use starklane::protocol::RequestBridge;
    use starklane::protocol::deploy;
    use starklane::token::erc721::{
        TokenInfo,
        SpanTokenInfoSerde,
        IERC721BridgeableDispatcher,
        IERC721BridgeableDispatcherTrait};

    struct Storage {
        // Bridge administrator.
        _bridge_admin: ContractAddress,
        // Mapping between L1<->L2 collections addresses.
        // <collection_l1_address, collection_l2_address>
        _l1_to_l2_addresses: LegacyMap::<felt252, ContractAddress>,
        // All the collections that were originally created on L2.
        _l2_originals: LegacyMap::<ContractAddress, bool>,
        // The class to deploy for ERC721 tokens.
        _erc721_bridgeable_class: ClassHash,
        // Registry of escrowed token for collections.
        // <(collection_l2_address, token_id), original_depositor_address>
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
    fn on_l1_message(from: ContractAddress, req: RequestBridge) {
        // TODO: weird, if I put the req.collection_l2_address inside the match
        // there is a move error. I have to extract it first here.
        let req_l2_addr = req.collection_l2_address;
        
        let collection_address = match ensure_collection_deployment(@req) {
            Option::Some(addr) => addr,
            Option::None(()) => req_l2_addr,
        };

        let collection = IERC721BridgeableDispatcher { contract_address: collection_address };

        let mut i = 0;
        loop {
            if i > req.tokens.len() {
                break ();
            }

            let token_id = *req.tokens[i].token_id;
            let to = req.owner_l2_address;
            let from = starknet::get_contract_address();

            if is_token_escrowed(collection_address, token_id) {
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
    /// Returns the deployed address if the deploy was made during this call,
    /// None otherwise.
    ///
    /// * `req` - Request for bridging assets.
    fn ensure_collection_deployment(req: @RequestBridge) -> Option<ContractAddress> {
        let l2_from_mapping = _l1_to_l2_addresses::read(*req.collection_l1_address);
        let is_l2_original = _l2_originals::read(*req.collection_l2_address);

        // TODO: how can we do a logical OR in cairo? `||` seems not possible.
        if is_l2_original {
            // Already deployed as created on L2.
            return Option::None(());
        }

        if !l2_from_mapping.is_zero() {
            // Already deployed L1 collection.
            return Option::None(());
        }

        // TODO: check if pedersen if strong enough here, or do we need poseidon?
        let salt = pedersen(*req.collection_l1_address, *req.owner_l1_address);

        let addr = deploy::deploy_erc721_bridgeable(
            _erc721_bridgeable_class::read(),
            salt,
            *req.collection_name,
            *req.collection_symbol
        );

        _l1_to_l2_addresses::write(*req.collection_l1_address, addr);

        CollectionDeloyedFromL1(
            *req.collection_l1_address,
            *req.collection_l2_address,
            *req.collection_name,
            *req.collection_symbol);

        Option::Some(addr)
    }

    // TODO: deposit NFT to go the other way.
    // #[external]
    // fn deposit_nfts() {
    //     let addr: ContractAddress = _escrow_contract::read();
    //     IBridgeEscrowDispatcher { contract_address: addr }.lock_tokens()
    // }

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

    #[internal]
    fn is_token_escrowed(collection_address: ContractAddress, token_id: u256) -> bool {
        !_escrow::read((collection_address, token_id)).is_zero()
    }

}
