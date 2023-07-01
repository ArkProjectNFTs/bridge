mod token_info;
use token_info::{TokenInfo, TokenInfoSerde, token_uri_from_contract_call};

mod erc721_bridgeable;

#[cfg(test)]
use erc721_bridgeable::tests::deploy;

mod interfaces;
use interfaces::{IERC721BridgeableDispatcher, IERC721BridgeableDispatcherTrait};
