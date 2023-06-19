#[abi]
trait IBridgeEscrow {
    fn lock_tokens();
    fn unlock_tokens();
}

#[contract]
mod EscrowBridge {
    use starknet::ContractAddress;
    use starklane::interfaces::IERC721::IERC721Dispatcher;
    use starklane::interfaces::IERC721::IERC721DispatcherTrait;
    use starklane::utils::serde;
    use array::SpanTrait;
    use array::ArrayTrait;
    use zeroable::Zeroable;
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::get_contract_address;
    use starknet::get_caller_address;
    use starknet::contract_address_const;

    struct Storage {
        bridge_address: ContractAddress,
        owner: ContractAddress,
        depositors: LegacyMap::<(ContractAddress, u256), ContractAddress>,
    }

    #[constructor]
    fn constructor(_owner: ContractAddress, _bridge_address: ContractAddress) {
        owner::write(_owner);
        bridge_address::write(_bridge_address);
    }

    // TODO: add a view to query if a token is loked for a given collection.
    fn is_locked(collection_address: ContractAddress, token_id: u256) -> bool {
        // Check if depositor is here for history, or to check if a token exists
        // and to know who deposit it.
        false
    }

    /// Locks tokens defining the escrow contract as tokens owner.
    ///
    /// * `from` - Address of the account that owns the tokens.
    /// * `collection_address` - Address of the ERC721 contract managing the tokens.
    /// * `tokens_ids` - List of tokens id to lock.
    #[external]
    fn lock_tokens(
        from: ContractAddress,
        collection_address: ContractAddress,
        token_ids: Span<u256>,
    ) {
        assert(!from.is_zero(), 'Invalid from address');
        assert(starknet::get_caller_address() == bridge_address::read(),
               'Only bridge can lock tokens');

        if token_ids.len() == 0 {
            return ();
        }

        let erc721_dispatcher = IERC721Dispatcher { contract_address: collection_address };
        let length = token_ids.len();

        let escrow_addr: ContractAddress = starknet::get_contract_address();

        let mut i = 0;
        loop {
            let mut data = ArrayTrait::new().span();
            let token_id = *token_ids.at(i);

            erc721_dispatcher.safe_transfer_from(
                from,
                escrow_addr,
                token_id,
                data);

            depositors::write((collection_address, token_id), from);

            if i == length {
                break ();
            }

            i += 1;
        }
    }

    /// Unlock tokens.
    ///
    /// * `collection_address` - Address of the ERC721 contract managing the tokens.
    /// * `tokens_ids` - List of tokens id to lock.
    /// * `to` - Account to which the tokens must be transfered.
    #[external]
    fn unlock_tokens(
        collection_address: ContractAddress,
        // TODO(glihm): change to array.
        token_id: u256,
        to: ContractAddress,
    ) {
        let caller = get_caller_address();
        assert(caller == bridge_address::read(), 'Only bridge can unlock tokens');
        let erc721_dispatcher = IERC721Dispatcher { contract_address: collection_address };
        let mut data = ArrayTrait::new().span();

        // TODO: verify into depositors/token on hold if the token of this collection
        // is here....!

        // Remove from depositors when it's gone??!
        erc721_dispatcher.safe_transfer_from(get_contract_address(), to, token_id, data);
    }

    #[view]
    fn get_depositor_address(
        token_contract_address: ContractAddress, token_id: u256
    ) -> ContractAddress {
        let depositor_address = depositors::read((token_contract_address, token_id));
        depositor_address
    }
}
