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
       @notice A message hash was added directly.
    */
    event AddedMessageHashFromL2(
        bytes32 indexed messageHash
    );

    /**
       @notice Adds the hash of a validated messaged from L2.

       @param msgHash Hash of the message to be considered as consumable.
    */
    function addMessageHashFromL2(
        uint256 msgHash
    )
        external
        payable
    {
        // TODO: add guard for whitelisted sender? Or not needed for now as it's
        // only used for local testing.

        bytes32 hash = bytes32(msgHash);
        emit AddedMessageHashFromL2(hash);
        l2ToL1Messages()[hash] += 1;
    }

}
