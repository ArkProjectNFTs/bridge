///! Bridge contract.
///!
///! The bridge contract is in charge to handle
///! the logic associated with bridge request from
///! a L1 message, or a deposit token from L2 transaction.
///!
///! Bridge needs to keep L1<->L2 reverse mapping up to date
///! to ensure all scenarios can be hanlded without deploying
///! the same collection twice.
///! This takes in account unexpected minting after collection
///! being bridged.

use starknet::{ContractAddress, ClassHash};
use starklane::protocol::BridgeRequest;

#[abi]
trait IBridge {
    fn on_l1_message(req: BridgeRequest) -> ContractAddress;

    fn deposit_tokens(
        req_hash: felt252,
        collection_l2_address: ContractAddress,
        owner_l1_address: felt252,
        tokens_ids: Span<u256>
    ) -> BridgeRequest;

    fn set_erc721_default_contract(class_hash: ClassHash);

    fn is_token_escrowed(collection_address: ContractAddress, token_id: u256) -> bool;
}

#[contract]
mod Bridge {
    use array::SpanTrait;
    use array::ArrayTrait;
    use traits::{Into, TryInto};
    use zeroable::Zeroable;
    use serde::Serde;
    use debug::PrintTrait;

    use starknet::{ClassHash, ContractAddress};
    use starknet::contract_address::ContractAddressZeroable;

    use starklane::utils::serde::SpanSerde;
    use starklane::protocol::BridgeRequest;
    use starklane::protocol::deploy;
    use starklane::token::erc721::{
        TokenInfo,
        TokenURI,
        SpanTokenInfoSerde,
        IERC721BridgeableDispatcher,
        IERC721BridgeableDispatcherTrait};

    // TODO(glihm): refacto when `Self` is supported inside imports.
    use starklane::token::erc721;

    struct Storage {
        // Bridge administrator.
        _bridge_admin: ContractAddress,
        // The class to deploy for ERC721 tokens.
        _erc721_bridgeable_class: ClassHash,
        // Mapping between L2<->L1 collections addresses.
        // <collection_l2_address, collection_l1_address>
        _l2_to_l1_addresses: LegacyMap::<ContractAddress, felt252>,
        // Mapping between L1<->L2 collections addresses.
        // <collection_l1_address, collection_l2_address>
        _l1_to_l2_addresses: LegacyMap::<felt252, ContractAddress>,
        // Registry of escrowed token for collections.
        // <(collection_l2_address, token_id), original_depositor_l2_address>
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

    #[view]
    fn is_token_escrowed(collection_address: ContractAddress, token_id: u256) -> bool {
        !_escrow::read((collection_address, token_id)).is_zero()
    }

    // *** EXTERNALS ***

    /// Simulates a message received from the L1.
    ///
    /// TODO: replace by the l1_handler. For that
    /// we must know exactly how deserialization works from l1_handler.
    ///
    /// TODO: Returns the contract address for testing purposes. Need to be revised.
    #[external]
    fn on_l1_message(req: BridgeRequest) -> ContractAddress{
        // TODO: check header version + len?
        // Length in header may be useless, only a version to start
        // to ensure we can upgrade both side without conflict.

        // TODO: add a global request verificator! (no owner addr to 0, at least 1 token, etc...)

        let collection_l2_address = _ensure_collection_deployment(@req);
        let collection = IERC721BridgeableDispatcher { contract_address: collection_l2_address };

        let mut i = 0;
        loop {
            if i == req.tokens.len() {
                break ();
            }

            let token_id = *req.tokens[i].token_id;
            let token_uri: TokenURI = *req.tokens[i].token_uri;
            let to = req.owner_l2_address;
            let from = starknet::get_contract_address();

            if _is_token_escrowed(collection_l2_address, token_id) {
                collection.transfer_from(from, to, token_id);
                // TODO: emit event.
            } else {
                collection.permissioned_mint(to, token_id, token_uri);
                // TODO: emit event.
            }

            i += 1;
        };

        collection_l2_address
    }

    /// Deposits tokens to be bridged on the L1.
    ///
    /// * `req_hash` - Request hash, unique identifier of the request.
    /// * `collection_l2_address` - Address of the collection on L2.
    /// * `owner_l1_address` - Address of the owner on L1.
    /// * `tokens_ids` - Tokens to be bridged on L1.
    ///
    /// TODO: The return type may be omitted, it's for debug for now.
    #[external]
    fn deposit_tokens(
        req_hash: felt252,
        collection_l2_address: ContractAddress,
        owner_l1_address: felt252,
        tokens_ids: Span<u256>
    ) -> BridgeRequest {
        // TODO: is that correct? The deposit_tokens is called from user's account contract?
        let from = starknet::get_caller_address();
        let to = starknet::get_contract_address();
        let collection = IERC721BridgeableDispatcher { contract_address: collection_l2_address };

        let collection_name = collection.name();
        let collection_symbol = collection.symbol();

        let mut tokens = ArrayTrait::<TokenInfo>::new();
        let mut i = 0;
        loop {
            if i == tokens_ids.len() {
                break ();
            }

            // TODO: Will revert if the approval missing. Do we need to check
            // the approval explicitely? Or it's fine like this?
            let token_id = *tokens_ids[i];
            collection.transfer_from(from, to, token_id);
            _escrow::write((collection_l2_address, token_id), from);

            let token_uri = match erc721::token_uri_from_contract_call(
                collection_l2_address,
                token_id) {
                Option::Some(uri) => uri,
                Option::None(_) => {
                    // TODO: Token URI missing for the token...? Revert? Skip?
                    'NO_URI'.into()
                }
            };

            tokens.append(TokenInfo {
                token_id,
                token_uri,
            });

            i += 1;
        };

        let collection_l1_address = _l2_to_l1_addresses::read(collection_l2_address);

        BridgeRequest {
            // TODO: define the header content.
            header: 1,
            req_hash,
            collection_l1_address,
            collection_l2_address,
            collection_name,
            collection_symbol,
            // TODO: to be defined with interfaces detection.
            collection_contract_type: 'ERC721',
            owner_l1_address,
            owner_l2_address: from,
            tokens: tokens.span(),
        }
    }

    /// Sets the default class hash to be deployed when the
    /// first token of a collection is bridged.
    ///
    /// * `class_hash` - Class hash of the ERC721 to set as default.
    #[external]
    fn set_erc721_default_contract(class_hash: ClassHash) {
        _ensure_is_admin();

        _erc721_bridgeable_class::write(class_hash);
    }

    #[external]
    fn replace_class(class_hash: ClassHash) {
        _ensure_is_admin();

        match starknet::replace_class_syscall(class_hash) {
            Result::Ok(_) => ReplacedClassHash(starknet::get_contract_address(), class_hash),
            Result::Err(revert_reason) => panic(revert_reason),
        };
    }

    // *** INTERNALS ***

    /// Ensures the caller is the bridge admin. Revert if it's not.
    #[internal]
    fn _ensure_is_admin() {
        assert(starknet::get_caller_address() == _bridge_admin::read(),
               'Unauthorized action');        
    }

    /// Returns true if the given token_id for the collection is present inside
    /// escrow storage, false otherwise.
    #[internal]
    fn _is_token_escrowed(collection_address: ContractAddress, token_id: u256) -> bool {
        !_escrow::read((collection_address, token_id)).is_zero()
    }

    /// Verifies the collection addresses in the request and the local mapping
    /// to determines the correctness of the request and if the collection
    /// must be deployed or not.
    ///
    /// Returns collection L2 address if deploy is required, else 0.
    #[internal]
    fn _verify_request_mapping_addresses(req: @BridgeRequest) -> ContractAddress {
        let l1_addr_req: felt252 = *req.collection_l1_address;
        let l2_addr_req: ContractAddress = *req.collection_l2_address;
        let l1_addr_mapping = _l2_to_l1_addresses::read(l2_addr_req);
        let l2_addr_mapping = _l1_to_l2_addresses::read(l1_addr_mapping);

        let mut panic_data: Array<felt252> = ArrayTrait::new();

        // L1 address must always be set as we receive the request from L1.
        if l1_addr_req.is_zero()
        {
            panic_data.append('L1 address cannot be 0');
            panic(panic_data);
        }

        // L1 address is present in the request and L2 address is not.
        if !l1_addr_req.is_zero() & l2_addr_req.is_zero() {
            if l2_addr_mapping.is_zero() {
                // It's the first token of the collection to be bridged.
                return ContractAddressZeroable::zero();
            } else {
                // It's not the first token of the collection to be bridged,
                // and the collection tokens were always bridged L1 -> L2.
                return l2_addr_mapping;
            }
        }

        // L1 address is present, and L2 address too.
        if !l1_addr_req.is_zero() & !l2_addr_req.is_zero() {
            if l2_addr_mapping != l2_addr_req {
                panic_data.append('Invalid collection L2 address');
                panic(panic_data);
            } else if l1_addr_mapping != l1_addr_req {
                panic_data.append('Invalid collection L1 address');
                panic(panic_data);
            } else {
                // All addresses match, we don't need to deploy anything.
                return l2_addr_mapping;
            }
        }

        panic_data.append('UNREACHABLE');
        panic(panic_data)
    }

    /// Deploys the collection contract, if necessary.
    /// Returns the address of the collection on l2.
    ///
    /// * `req` - Request for bridging assets.
    #[internal]
    fn _ensure_collection_deployment(req: @BridgeRequest) -> ContractAddress {
        let collection_l2_addr = _verify_request_mapping_addresses(req);

        if !collection_l2_addr.is_zero() {
            return collection_l2_addr;
        }

        // TODO: check if pedersen if strong enough here, or do we need poseidon?
        let salt = pedersen(*req.collection_l1_address, *req.owner_l1_address);

        let l2_addr_from_deploy = deploy::deploy_erc721_bridgeable(
            _erc721_bridgeable_class::read(),
            salt,
            *req.collection_name,
            *req.collection_symbol,
            starknet::get_contract_address(),
        );

        _l1_to_l2_addresses::write(*req.collection_l1_address, l2_addr_from_deploy);
        _l2_to_l1_addresses::write(l2_addr_from_deploy, *req.collection_l1_address);

        CollectionDeloyedFromL1(
            *req.collection_l1_address,
            l2_addr_from_deploy,
            *req.collection_name,
            *req.collection_symbol);

        l2_addr_from_deploy
    }


}

#[cfg(test)]
mod tests {

    use super::Bridge;

    use starklane::token::erc721::interfaces::{IERC721BridgeableDispatcher, IERC721BridgeableDispatcherTrait};

    use serde::Serde;
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;
    use option::OptionTrait;
    use core::result::ResultTrait;
    use traits::{TryInto, Into};
    use starknet::contract_address::Felt252TryIntoContractAddress;
    use starknet::class_hash::Felt252TryIntoClassHash;
    use starknet::{ContractAddress,ClassHash};

    use starklane::token::erc721::{TokenURI, Felt252IntoTokenURI};
    use starklane::token::erc721;

    use starknet::testing;

    /// Deploy a bridge instance.
    fn deploy(
        admin_addr: ContractAddress,
    ) -> ContractAddress {

        let mut calldata: Array<felt252> = array::ArrayTrait::new();
        calldata.append(admin_addr.into());

        let (addr, _) = starknet::deploy_syscall(
            Bridge::TEST_CLASS_HASH.try_into().unwrap(),
            0,
            calldata.span(),
            false).expect('deploy_syscall failed');

        addr
    }

}
