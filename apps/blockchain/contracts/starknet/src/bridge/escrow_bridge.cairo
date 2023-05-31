#[abi]
trait IBridgeEscrow {
    fn deposit_nfts();
}

#[contract]
mod EscrowBridge {

    use starknet::ContractAddress;

    struct Storage {
        bridge_address: ContractAddress,
        owner: ContractAddress
    }

    #[constructor]
    fn constructor(_owner: ContractAddress, _bridge_address: ContractAddress) {
        owner::write(_owner);
        bridge_address::write(_bridge_address);
    }

    #[external]
    fn deposit_nfts() {}
}
