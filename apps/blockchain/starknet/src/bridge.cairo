#[starknet::contract]
mod bridge {
    use core::byte_array::ByteArrayTrait;
    use array::{ArrayTrait, SpanTrait};
    use traits::{Into, TryInto};
    use zeroable::Zeroable;
    use serde::Serde;
    use option::OptionTrait;
    use debug::PrintTrait;

    use core::starknet::SyscallResultTrait;

    use starknet::{ClassHash, ContractAddress, EthAddress};
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::eth_address::EthAddressZeroable;

    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::access::ownable::interface::{
        IOwnableDispatcher, IOwnableDispatcherTrait
    };

    use starklane::interfaces::{IStarklane, 
        IUpgradeable, IUpgradeableDispatcher, IUpgradeableDispatcherTrait, 
        IStarklaneCollectionAdmin};
    // events
    use starklane::interfaces::{
        DepositRequestInitiated,
        WithdrawRequestCompleted,
        CollectionDeployedFromL1,
        ReplacedClassHash,
        BridgeEnabled,
        CollectionWhiteListUpdated,
    };

    use starklane::request::{
        Request,
        compute_request_header_v1,
        compute_request_hash,
        collection_type_from_header,
    };
    use starklane::token::{
        interfaces::{
            IERC721Dispatcher, IERC721DispatcherTrait,
            IERC721BridgeableDispatcher, IERC721BridgeableDispatcherTrait,
        },
        collection_manager::{
            CollectionType,
            deploy_erc721_bridgeable, verify_collection_address, erc721_metadata,
        },
    };

    use poseidon::poseidon_hash_span;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableTwoStepMixinImpl = OwnableComponent::OwnableTwoStepMixinImpl<ContractState>;

    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        // Bridge address on L1 (to allow it to consume messages).
        bridge_l1_address: EthAddress,
        // The class to deploy for ERC721 tokens.
        erc721_bridgeable_class: ClassHash,
        // Mapping between L2<->L1 collections addresses.
        l2_to_l1_addresses: LegacyMap::<ContractAddress, EthAddress>,
        // Mapping between L1<->L2 collections addresses.
        l1_to_l2_addresses: LegacyMap::<EthAddress, ContractAddress>,
        // Registry of escrowed token for collections.
        // <(collection_l2_address, token_id), original_depositor_l2_address>
        escrow: LegacyMap::<(ContractAddress, u256), ContractAddress>,

        // White list enabled flag
        white_list_enabled: bool,
        
        // Registry of whitelisted collections
        white_listed_list: LegacyMap::<ContractAddress, (bool, ContractAddress)>,
        white_listed_head: ContractAddress,
        
        // Bridge enabled flag
        enabled: bool,
        
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        bridge_admin: ContractAddress,
        bridge_l1_address: EthAddress,
        erc721_bridgeable_class: ClassHash,
    ) {
        self.ownable.initializer(bridge_admin);
        // TODO: add validation of inputs.
        self.bridge_l1_address.write(bridge_l1_address);
        self.erc721_bridgeable_class.write(erc721_bridgeable_class);
        self.white_list_enabled.write(false);
        self.enabled.write(false); // disabled by default
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        DepositRequestInitiated: DepositRequestInitiated,
        CollectionDeployedFromL1: CollectionDeployedFromL1,
        WithdrawRequestCompleted: WithdrawRequestCompleted,
        ReplacedClassHash: ReplacedClassHash,
        BridgeEnabled: BridgeEnabled,
        CollectionWhiteListUpdated: CollectionWhiteListUpdated,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }


    /// Process message from L1 to withdraw token.
    ///
    /// # Arguments
    ///
    /// `from_address` - L1 sender address, must be Starklane L1.
    /// `req` - The request containing tokens to bridge.
    ///
    /// TODO: isn't better to receive a raw Span<felt252>
    /// to be more flexible? And the first felt25 being the header
    /// defines how the deserialization takes place?
    #[l1_handler]
    fn withdraw_auto_from_l1(
        ref self: ContractState,
        from_address: felt252,
        req: Request
    ) {
        ensure_is_enabled(@self);
        assert(self.bridge_l1_address.read().into() == from_address,
               'Invalid L1 msg sender');

        // TODO: recompute HASH to ensure data are not altered.
        // TODO: Validate all fields the request (cf. FSM).

        let collection_l2 = ensure_erc721_deployment(ref self, @req);

        let _ctype = collection_type_from_header(req.header);
        // TODO: check CollectionType to support ERC1155 + metadata.

        let mut i = 0;
        loop {
            if i == req.ids.len() {
                break ();
            }

            let token_id = *req.ids[i];

            let to = req.owner_l2;
            let from = starknet::get_contract_address();

            let is_escrowed = !self.escrow.read((collection_l2, token_id)).is_zero();

            if is_escrowed {
                IERC721Dispatcher { contract_address: collection_l2 }
                .transfer_from(from, to, token_id);
            } else {
                if (req.uris.len() != 0) {
                    let token_uri = req.uris[i];
                    IERC721BridgeableDispatcher { contract_address: collection_l2 }
                    .mint_from_bridge_uri(to, token_id, token_uri.clone());
                } else {
                    IERC721BridgeableDispatcher { contract_address: collection_l2 }
                    .mint_from_bridge(to, token_id);
                }
            }

            i += 1;
        };

        self.emit(WithdrawRequestCompleted {
            hash: req.hash,
            block_timestamp: starknet::info::get_block_timestamp(),
            req_content: req
        });
    }

    #[abi(embed_v0)]
    impl BridgeUpgradeImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, class_hash: ClassHash) {
            ensure_is_admin(@self);

            match starknet::replace_class_syscall(class_hash) {
                Result::Ok(_) => {
                    self.emit(ReplacedClassHash {
                        contract: starknet::get_contract_address(),
                        class: class_hash,
                    })
                },
                Result::Err(revert_reason) => panic(revert_reason),
            };
        }
    }

    #[abi(embed_v0)]
    impl BridgeImpl of IStarklane<ContractState> {

        fn get_l1_collection_address(self: @ContractState, address: ContractAddress) -> EthAddress {
            self.l2_to_l1_addresses.read(address)
        }

        fn get_l2_collection_address(self: @ContractState, address: EthAddress) -> ContractAddress {
            self.l1_to_l2_addresses.read(address)
        }

        fn set_bridge_l1_addr(ref self: ContractState, address: EthAddress) {
            ensure_is_admin(@self);
            self.bridge_l1_address.write(address);
        }

        fn get_bridge_l1_addr(self: @ContractState) -> EthAddress {
            self.bridge_l1_address.read()
        }

        fn set_erc721_class_hash(ref self: ContractState, class_hash: ClassHash) {
            ensure_is_admin(@self);
            self.erc721_bridgeable_class.write(class_hash);
        }

        fn get_erc721_class_hash(self: @ContractState) -> ClassHash {
            self.erc721_bridgeable_class.read()
        }

        /// Deposits tokens to be bridged on the L1.
        ///
        /// # Arguments
        ///
        /// * `salt` - Randome salt to compute request hash.
        /// * `collection_l2` - Address of the collection on L2.
        /// * `owner_l1` - Address of the owner on L1.
        /// * `tokens_ids` - Tokens to be bridged on L1.
        /// * `use_withdraw_auto` - Tokens are automatically withdrawn on L1 using Starklane indexer.
        /// * `use_deposit_burn_auto` - Tokens are automatically burnt on L2 once transferred using Starklane indexer.
        ///
        /// TODO: add new_owners, values and uris.
        /// TODO: better to use a struct than too much arguments? (DepositParams/DepositInputs/???)
        fn deposit_tokens(
            ref self: ContractState,
            salt: felt252,
            collection_l2: ContractAddress,
            owner_l1: EthAddress,
            token_ids: Span<u256>,
            use_withdraw_auto: bool,
            use_deposit_burn_auto: bool,
        ) {
            ensure_is_enabled(@self);
            assert(!self.bridge_l1_address.read().is_zero(), 'Bridge is not open');

            // TODO: we may have the "from" into the params, to allow an operator
            // to deposit token for a user.
            // This can open more possibilities.
            // Because anyway, a token can't be moved if the owner of the token
            // is not giving approval to the bridge.
            let from = starknet::get_caller_address();

            assert(_is_white_listed(@self, collection_l2), 'Collection not whitelisted');

            // TODO: add support for 1155 and check the detected interface on the collection.
            let ctype = CollectionType::ERC721;

            let erc721_metadata = erc721_metadata(collection_l2, Option::Some(token_ids));
            let (name, symbol, base_uri, uris) = match erc721_metadata {
                Option::Some(data) => (data.name, data.symbol, data.base_uri, data.uris),
                Option::None => ("", "", "", array![].span())
            };

            escrow_deposit_tokens(ref self, collection_l2, from, token_ids);

            let collection_l1 = self.l2_to_l1_addresses.read(collection_l2);

            let req = Request {
                header: compute_request_header_v1(ctype, use_deposit_burn_auto, use_withdraw_auto),
                hash: compute_request_hash(salt, collection_l2, owner_l1, token_ids),
                collection_l1,
                collection_l2,
                owner_l1,
                owner_l2: from,
                name,
                symbol,
                base_uri,
                ids: token_ids,
                values: array![].span(),
                uris,
                new_owners: array![].span(),
            };

            let mut buf: Array<felt252> = array![];
            req.serialize(ref buf);

            starknet::send_message_to_l1_syscall(
                self.bridge_l1_address.read().into(),
                buf.span(),
            )
                .unwrap_syscall();
            
            self.emit(DepositRequestInitiated {
                hash: req.hash,
                block_timestamp: starknet::info::get_block_timestamp(),
                req_content: req
            });
        }

        fn enable_white_list(ref self: ContractState, enable: bool) {
            ensure_is_admin(@self);
            self.white_list_enabled.write(enable);
        }

        fn is_white_list_enabled(self: @ContractState) -> bool {
            self.white_list_enabled.read()
        }

        fn white_list_collection(ref self: ContractState, collection: ContractAddress, enabled: bool) {
            ensure_is_admin(@self);
            _white_list_collection(ref self, collection, enabled);
            self.emit(CollectionWhiteListUpdated {
                collection,
                enabled,
            });
        }

        fn is_white_listed(self: @ContractState, collection: ContractAddress) -> bool {
            _is_white_listed(self, collection)
        }

        fn get_white_listed_collections(self: @ContractState) -> Span<ContractAddress> {
            let mut white_listed = array![];
            let mut current = self.white_listed_head.read();
            loop {
                if current.is_zero() {
                    break;
                }
                let (enabled, next) = self.white_listed_list.read(current);
                if !enabled {
                    break;
                } else {
                    white_listed.append(current);
                    current = next;
                }
            };
            white_listed.span()
        }

        fn enable(ref self: ContractState, enable: bool) {
            ensure_is_admin(@self);
            self.enabled.write(enable);
            self.emit(BridgeEnabled {
                enable: enable
            });
        }

        fn is_enabled(self: @ContractState) -> bool {
            self.enabled.read()
        }

        fn set_l1_l2_collection_mapping(ref self: ContractState, collection_l1: EthAddress, collection_l2: ContractAddress) {
            ensure_is_admin(@self);
            self.l1_to_l2_addresses.write(collection_l1, collection_l2);
            self.l2_to_l1_addresses.write(collection_l2, collection_l1);
        }
    }

    #[abi(embed_v0)]
    impl BridgeCollectionAdminImpl of IStarklaneCollectionAdmin<ContractState> {
        fn collection_upgrade(ref self: ContractState, collection: ContractAddress, class_hash: ClassHash) {
            ensure_is_admin(@self);
            IUpgradeableDispatcher { contract_address: collection }
                .upgrade(class_hash);
        }

        // transfer owner of the given collection to the given address
        fn collection_transfer_ownership(ref self: ContractState, collection: ContractAddress, new_owner: ContractAddress) {
            ensure_is_admin(@self);
            IOwnableDispatcher { contract_address: collection }
                .transfer_ownership(new_owner);
        }
    }

    // *** INTERNALS ***

    /// Ensures the caller is the bridge admin. Revert if it's not.
    fn ensure_is_admin(self: @ContractState) {
        self.ownable.assert_only_owner();
    }

    /// Ensures the bridge is enabled
    fn ensure_is_enabled(self: @ContractState) {
        assert!(self.enabled.read(), "Bridge disabled");
    }

    /// Deposit the given tokens into escrow.
    ///
    /// # Arguments
    ///
    /// * `contract_address` - Collection address on L2.
    /// * `from` - Current owner of the token.
    /// * `token_ids` - Tokens to deposit.
    fn escrow_deposit_tokens(
        ref self: ContractState,
        contract_address: ContractAddress,
        from: ContractAddress,
        token_ids: Span<u256>,
    ) {
        let to = starknet::get_contract_address();
        let erc721 = IERC721Dispatcher { contract_address };

        let mut i = 0_usize;
        loop {
            if i == token_ids.len() {
                break ();
            }

            let token_id = *token_ids[i];
            erc721.transfer_from(from, to, token_id);
            self.escrow.write((contract_address, token_id), from);
            i += 1;
        };
    }

    /// Deploys the collection contract, if necessary.
    /// Returns the address of the collection on l2.
    ///
    /// * `req` - Request for bridging assets.
    fn ensure_erc721_deployment(ref self: ContractState, req: @Request) -> ContractAddress {

        let l1_req: EthAddress = *req.collection_l1;
        let l2_req: ContractAddress = *req.collection_l2;

        let collection_l2 = verify_collection_address(
            l1_req,
            l2_req,
            self.l2_to_l1_addresses.read(l2_req),
            self.l1_to_l2_addresses.read(l1_req),
        );

        if !collection_l2.is_zero() {
            return collection_l2;
        }

        let hash = *req.hash;
        let salt_data: Span<felt252> = array![hash.low.into(), hash.high.into()].span();
        let salt = poseidon_hash_span(salt_data);

        let l2_addr_from_deploy = deploy_erc721_bridgeable(
            self.erc721_bridgeable_class.read(),
            salt,
            req.name.clone(),
            req.symbol.clone(),
            req.base_uri.clone(),
            starknet::get_contract_address(),
        );

        self.l1_to_l2_addresses.write(l1_req, l2_addr_from_deploy);
        self.l2_to_l1_addresses.write(l2_addr_from_deploy, l1_req);

        self
            .emit(
                CollectionDeployedFromL1 {
                    l1_addr: *req.collection_l1,
                    l2_addr: l2_addr_from_deploy,
                    name: req.name.clone(),
                    symbol: req.symbol.clone()
                }
            );

        // update whitelist if needed
        let (already_white_listed, _) = self.white_listed_list.read(l2_addr_from_deploy);
        if already_white_listed != true {
            _white_list_collection(ref self, l2_addr_from_deploy, true);
            self.emit(CollectionWhiteListUpdated {
                collection: l2_addr_from_deploy,
                enabled: true,
            });
        }
        l2_addr_from_deploy
    }

    fn _is_white_listed(self: @ContractState, collection: ContractAddress) -> bool {
            let enabled = self.white_list_enabled.read();
            if (enabled) {
                let (ret, _) = self.white_listed_list.read(collection);
                return ret;
            }
            true
    }

    fn _white_list_collection(ref self: ContractState, collection: ContractAddress, enabled: bool) {
        let no_value = starknet::contract_address_const::<0>();
        let (current, _) = self.white_listed_list.read(collection);
        if current != enabled {
            let mut prev = self.white_listed_head.read();
            if enabled {
                self.white_listed_list.write(collection, (enabled, no_value));
                if prev.is_zero() {
                    self.white_listed_head.write(collection);
                    return;
                }
                // find last element
                loop {
                    let (_, next) = self.white_listed_list.read(prev);
                    if next.is_zero() {
                        break;
                    }
                    let (active, _) = self.white_listed_list.read(next);
                    if !active {
                        break;
                    }
                    prev = next;
                };
                self.white_listed_list.write(prev, (true, collection));
            } else { 
                // change head
                if prev == collection {
                    let (_, next) = self.white_listed_list.read(prev);
                    self.white_listed_list.write(collection, (false, no_value));
                    self.white_listed_head.write(next);
                    return;
                }
                // removed element from linked list
                loop {
                    let (active, next) = self.white_listed_list.read(prev);
                    if next.is_zero() {
                        // end of list
                        break;
                    }
                    if !active {
                        break;
                    }
                    if next == collection {
                        let (_, target) = self.white_listed_list.read(collection);
                        self.white_listed_list.write(prev, (active, target));
                        break;
                    }
                };
                self.white_listed_list.write(collection, (false, no_value));
            }
        }
    }
}
