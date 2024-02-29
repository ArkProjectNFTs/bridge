// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.8.0;

import "starknet/StarknetMessaging.sol";

/**
   @title A superset of StarknetMessaging to support
   local development by adding a way to directly register
   a message hash ready to be consumed, without waiting the block
   to be verified.

   @dev The idea is that, to now wait on the block to be proved,
   this messaging contract can receive directly a hash of a message
   to be considered as `received`. This message can then be consumed.

   The goal of this contract is local development only.
*/
contract StarknetMessagingLocal is StarknetMessaging {

   /**
       @notice Hashes were added.
    */
    event MessageHashesAddedFromL2(
        uint256[] hashes
    );

    /**
       @notice Adds the hashes of messages from L2.

       @param msgHashes Hashes to register as consumable.
    */
    function addMessageHashesFromL2(
        uint256[] calldata msgHashes
    )
        external
        payable
    {
        // TODO: You can add here a whitelist of senders if you wish.
        for (uint256 i = 0; i < msgHashes.length; i++) {
            bytes32 hash = bytes32(msgHashes[i]);
            l2ToL1Messages()[hash] += 1;
        }

        emit MessageHashesAddedFromL2(msgHashes);
    }


    // expose internal for testing purpose
    function setMessageCancellationDelay(uint256 delayInSeconds) external {
        messageCancellationDelay(delayInSeconds);
    }

}
