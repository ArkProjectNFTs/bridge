// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 */
interface IERC721MintRangeFree {
    /**
       @notice A free minting for testing.
    */
    function mintRangeFree(
        address to,
        uint256 idStart,
        uint256 idEnd
    )
        external;
}
