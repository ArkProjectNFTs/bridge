// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 */
interface IStarknetMessagingLocal {

    /**
     */
    function addMessageHashFromL2(
        uint256 msgHash
    )
        external
        payable;

}
