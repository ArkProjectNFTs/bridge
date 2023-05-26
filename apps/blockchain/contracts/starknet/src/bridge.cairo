use starknet::ContractAddress;

#[abi]
trait IBridgableToken {
    fn permissioned_mint(to: ContractAddress, token_id: u256);
}

#[contract]
mod Bridge {
    use starknet::ContractAddress;
    use super::IBridgableTokenDispatcherTrait;
    use super::IBridgableTokenDispatcher;
    use starknet::contract_address_const;

    struct Storage {
        _l1_to_l2_addresses: LegacyMap::<ContractAddress, ContractAddress>
    }

    #[view]
    fn read_l2_address(l1_address: ContractAddress) -> ContractAddress {
        _l1_to_l2_addresses::read(l1_address)
    }

    #[external]
    fn mint_token(
        l1_address: ContractAddress, l2_recipient_address: ContractAddress, token_id: u256
    ) {
        let l2_contract_address: ContractAddress = _l1_to_l2_addresses::read(l1_address);
        if (l2_contract_address != contract_address_const::<0>()) {
            IBridgableTokenDispatcher {
                contract_address: l2_contract_address
            }.permissioned_mint(l2_recipient_address, token_id)
        } else {
            deploy_new_contract()
        }
    }

    #[internal]
    fn deploy_new_contract() {}
}
