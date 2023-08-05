// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./sn/Cairo.sol";

import "starknet/IStarknetMessaging.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/*
 * Starklane state.
 */
contract StarklaneState is Ownable {

    // StarknetCore.
    IStarknetMessaging _starknetCoreAddress;

    // Starklane L2 address for messaging.
    snaddress _starklaneL2Address;

    // Bridge L2 selector to deposit token from L1.
    felt252 _starklaneL2Selector;

    // Mapping between L2<->L1 contracts addresses.
    mapping(snaddress => address) _l2ToL1Addresses;

    // Mapping between L1<->L2 contracts addresses.
    mapping(address => snaddress) _l1ToL2Addresses;

    // Escrowed token.
    // Mapping of the contract address, to the mapping (token_id, depositor address).
    mapping(address => mapping(uint256 => address)) _escrow;

    /*
     * Retrieves info about Starklane L2 mapping.
     */
    function l2Info()
        external
        view
        returns (snaddress, felt252) {
        return (_starklaneL2Address, _starklaneL2Selector);
    }

    /*
     * Sets Starklane L2 address.
     */
    function setStarklaneL2Address(snaddress l2Address)
        public
        onlyOwner {
        _starklaneL2Address = l2Address;
    }

    /*
     * Sets Starklane L2 selector of Starklane L2 contract
     * to be called when a message arrives into Starknet.
     */
    function setStarklaneL2Selector(felt252 l2Selector)
        public
        onlyOwner {
        _starklaneL2Selector = l2Selector;
    }


}
