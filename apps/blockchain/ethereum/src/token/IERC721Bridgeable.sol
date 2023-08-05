// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
   @title ERC721Bridgeable token.
   
   @notice This interface allows a contract to expose functions
   that allows a bridge to mint and burn token.
*/
interface IERC721Bridgeable {

    /**
       @notice Mints a token from the bridge.

       @param to The new owner.
       @param id The token to mint.
    */
    function mintFromBridge(address to, uint256 id)
        external;

    /**
       @notice Burns a token from the bridge.

       @param id The token to burn.
    */
    function burnFromBridge(uint256 id)
        external;

}
