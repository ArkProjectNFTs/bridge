// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "starknet/IStarknetMessaging.sol";

import "./sn/Cairo.sol";

uint256 constant WITHDRAW_AUTO_NONE = 0x00;
uint256 constant WITHDRAW_AUTO_READY = 0x01;
uint256 constant WITHDRAW_AUTO_CONSUMED = 0x02;

error WithdrawMethodError();
error WithdrawAlreadyError();

/**
   @title Contract responsible of withdrawing token from messaging.

   @dev If any message is configured to be withdraw with the auto methods,
   then the regular starknet messaging will always be ignored and vice-versa.

   In solidity, when we query a mapping, if the key does not exist, 0 is returned when
   the value is an uint256.

   For this reason, we use here a enum-like to ensure the correct state of the message.
*/
contract StarklaneMessaging is Ownable {

    // Messages sent directly from L2 indexer, that can be withdrawn with
    // the auto method.
    //
    // The mapping mimics the Starknet messaging with a ref count like status.
    mapping(bytes32 => uint256) _autoWithdrawn;

    /**
     */
    event MessageHashAutoWithdrawAdded(bytes32 msgHash);

    /**
       @notice Adds the hash of a message that can be consumed with the auto
       method.

       @param msgHash Hash of the message to be considered as consumable.
    */
    function addMessageHashForAutoWithdraw(
        uint256 msgHash
    )
        external
        payable
        onlyOwner
    {
        bytes32 hash = bytes32(msgHash);

        if (_autoWithdrawn[hash] != WITHDRAW_AUTO_NONE) {
            revert WithdrawMethodError();
        }

        _autoWithdrawn[hash] = WITHDRAW_AUTO_READY;
        emit MessageHashAutoWithdrawAdded(hash);
    }

    /**
       @notice Consumes a message with the Auto withdraw method.

       @param fromL2Address Address of the L2 contract that send the message.
       @param request Request containing the tokens to withdraw.
    */
    function _consumeMessageAutoWithdraw(
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

        uint256 status = _autoWithdrawn[msgHash];

        if (status == WITHDRAW_AUTO_CONSUMED) {
            revert WithdrawAlreadyError();
        }

        _autoWithdrawn[msgHash] = WITHDRAW_AUTO_CONSUMED;
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

        // If the message were configured to be withdrawn with auto method,
        // starknet method is denied.
        if (_autoWithdrawn[msgHash] != WITHDRAW_AUTO_NONE) {
            revert WithdrawMethodError();
        }
    }


}
