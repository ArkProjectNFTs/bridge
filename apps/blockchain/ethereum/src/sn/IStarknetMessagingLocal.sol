// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 */
interface IStarknetMessagingLocal {

    /**
     */
    function addMessageHashesFromL2(
        uint256[] calldata msgHashes
    )
        external
        payable;

    function setMessageCancellationDelay(
        uint256 delayInSeconds
    ) external;
}
