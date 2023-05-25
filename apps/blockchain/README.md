# Starklane NFT Bridge

This `blockchain` app contains smart contracts written in Solidity and StarkNet that enable the seamless bridging of non-fungible assets between Ethereum Layer 1 (L1) and StarkNet Layer 2 (L2).

## Getting Started

Make sure you have all your dependencies installed:

`yarn install`

Compile all contracts:

`yarn build`

or compile only the contract for one side:

```
yarn ethereum:build
yarn starknet:build
```

## Development

Launch an Ethereum node using the Hardhat network locally on your machine:

`yarn ethereum:chain`

Run unit tests for the smart contracts:

`yarn test`
