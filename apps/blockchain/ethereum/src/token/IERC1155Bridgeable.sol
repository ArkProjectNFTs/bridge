// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
   @title ERC1155Bridgeable token.
   
   @notice This interface allows a contract to expose functions
   that allows a bridge to mint and burn token.
*/
interface IERC1155Bridgeable {

    /**
       @notice Mints a token from the bridge.

       @param to The new owner.
       @param id The token type to mint.
       @param value Amount of the token.
    */
    function mintFromBridge(address to, uint256 id, uint256 value)
        external;

    /**
       @notice Burns a token from the bridge.

       @param from The owner burning tokens.
       @param id The token type to burn.
       @param value Amount to burn.
    */
    function burnFromBridge(address from, uint256 id, uint256 value)
        external;

}
