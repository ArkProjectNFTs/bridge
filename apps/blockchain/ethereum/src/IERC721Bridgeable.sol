// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * ERC721Bridgeable token.
 *
 * This interface allows a contract to expose functions
 * that allows a bridge to mint and burn token.
 */
interface IERC721Bridgeable {

    /*
     * Mints a token from the bridge.
     */
    function mintFromBridge(address to, uint256 tokenId) external;

    /*
     * Burns a token from the bridge.
     */
    function burnFromBridge(uint256 id) external;

}
