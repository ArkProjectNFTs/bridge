// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "starknet/IStarknetMessaging.sol";

import "./sn/Cairo.sol";

// When set to QUICK_NONE, the request were not sent with the option for withdrawQuick.
uint256 constant QUICK_NONE = 0x00;
// When set to QUICK_AVAILABLE, tokens can be withdrawn.
uint256 constant QUICK_AVAILABLE = 0x01;
// When set to QUICK_WITHDRAWN, token were withdrawn.
uint256 constant QUICK_WITHDRAWN = 0x02;

/**
   @title Contract responsible of withdrawing token from messaging.

   @dev If any message is configured to be withdraw with the QUICK methods,
   then the regular starknet messaging will always be ignored and vice-versa.

   In solidity, when we query a mapping, if the key does not exist, 0 is returned when
   the value is an uint256.

   For this reason, we use here a enum-like to ensure the correct state of the message.
*/
contract StarklaneMessaging is Ownable {

    // Messages sent directly from L2 indexer, that can be withdrawn with
    // the QUICK method.
    //
    // The mapping mimics the Starknet messaging with a ref count like status.
    mapping(bytes32 => uint256) _withdrawQuick;

    /**
     */
    event MessageHashAddedQuick(bytes32 msgHash);

    /**
       @notice Adds the hash of a message that can be consumed with the QUICK
       method.

       @param msgHash Hash of the message to be considered as consumable.
    */
    function addMessageHashForQuick(
        uint256 msgHash
    )
        external
        payable
        onlyOwner
    {
        bytes32 hash = bytes32(msgHash);

        require(
            _withdrawQuick[hash] == QUICK_NONE,
            "QUICK_NONE is expected to register a new message."
        );

        _withdrawQuick[hash] = QUICK_AVAILABLE;
        emit MessageHashAddedQuick(hash);
    }

    /**
       @notice Consumes a message with the QUICK method.

       @param fromL2Address Address of the L2 contract that send the message.
       @param request Request containing the tokens to withdraw.
    */
    function _consumeMessageQuick(
        snaddress fromL2Address,
        uint256[] memory request
    )
        internal
    {
        bytes32 msgHash = keccak256(
            abi.encodePacked(
                snaddress.unwrap(fromL2Address),
                uint256(uint160(address(this))),
                request.length,
                request)
        );

        uint256 quickStatus = _withdrawQuick[msgHash];

        if (quickStatus == QUICK_NONE) {
            revert("Tokens from this request cannot be withdrawn with the QUICK method.");
        } else if (quickStatus == QUICK_WITHDRAWN) {
            revert("Tokens from this request were already withdrawn.");
        }

        _withdrawQuick[msgHash] = QUICK_WITHDRAWN;
    }

    /**
       @notice Consumes a message from Starknet core contract.

       @param starknetCore Address of the Starknet Core contract.
       @param fromL2Address Address of the L2 contract that send the message.
       @param request Request containing the tokens to withdraw.
    */
    function _consumeMessageStarknet(
        IStarknetMessaging starknetCore,
        snaddress fromL2Address,
        uint256[] memory request
    )
        internal
    {
        // Will revert if the message is not consumable.
        bytes32 msgHash = starknetCore.consumeMessageFromL2(
            snaddress.unwrap(fromL2Address),
            request
        );

        // If the message were configured to be withdrawn with QUICK method,
        // starknet method is denied.
        require(
            _withdrawQuick[msgHash] == QUICK_NONE,
            "Tokens from this request cannot be withdrawn with the STARKNET method."
        );
    }


}
