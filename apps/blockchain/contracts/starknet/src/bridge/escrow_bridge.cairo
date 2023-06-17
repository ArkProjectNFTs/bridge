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

    #[external]
    fn lock_tokens(token_contract_address: ContractAddress, token_ids: Span<u256>) {
        let caller = starknet::get_caller_address();
        assert(caller == bridge_address::read(), 'Only bridge can unlock tokens');
        let erc721_dispatcher = IERC721Dispatcher { contract_address: token_contract_address };
        let length = token_ids.len();

        let mut i = 0;
        loop {
            let mut data = ArrayTrait::new().span();
            let token_id = *token_ids.at(i);
            let contract_addr: ContractAddress = starknet::get_contract_address();
            erc721_dispatcher.safe_transfer_from(caller, contract_addr, token_id, data);
            depositors::write((token_contract_address, token_id), caller);

            if i == length {
                break ();
            }

            i += 1;
        }
    }

    #[external]
    fn unlock_tokens(token_contract_address: ContractAddress, token_id: u256, to: ContractAddress) {
        let caller = get_caller_address();
        assert(caller == bridge_address::read(), 'Only bridge can unlock tokens');
        let erc721_dispatcher = IERC721Dispatcher { contract_address: token_contract_address };
        let mut data = ArrayTrait::new().span();
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
