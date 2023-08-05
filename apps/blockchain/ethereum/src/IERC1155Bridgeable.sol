// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * ERC1155Bridgeable token.
 *
 * This interface allows a contract to expose functions
 * that allows a bridge to mint and burn token.
 */
interface IERC1155Bridgeable {

    /*
     * Mints a token from the bridge.
     */
    function mintFromBridge(address to, uint256 id, uint256 value)
        external;

    /*
     * Burns a token from the bridge.
     */
    function burnFromBridge(address from, uint256 id, uint256 value)
        external;

}
