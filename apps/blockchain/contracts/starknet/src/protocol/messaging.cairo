///! Messaging protocol
///!
///! The protocol for messaging is based
///! on the native type of cairo: felt252.
///! Felts are 32 bytes long when serialized.
///!
///! A message is composed of the following:
///!
///! The first felt252 (always present), is a header
///! which is being decoded to understand which structure
///! the message payload has.
///!
///! In the current version, the header is then followed
///! by the payload (other felt252) which are a serialized
///! requests for token to be bridged.

use traits::Into;
use serde::Serde;
use array::ArrayTrait;

use starklane::token::{TokenURI};

///! Request for a token to be bridged.
#[derive(Drop)]
struct RequestTokenBridge {
    // Collection information.
    collection_l1_address: u256,
    collection_name: felt252,
    collection_symbol: felt252,
    // Owner information.
    owner_l1_address: u256,
    owner_l2_address: felt252,
    // If the contract is ERC721 or ERC1155.
    contract_type: felt252,
    // Token info.
    token_id: u256,
    token_uri: TokenURI,
}

