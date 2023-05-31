#[contract]
mod EscrowBridge {
    #[external]
    fn deposit_nft(
        tokenAddress: ContractAddress, tokenId: u256, addressdepositorAddress: ContractAddress
    ) {}
}
