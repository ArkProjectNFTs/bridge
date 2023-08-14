// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";

import "../../src/token/IERC1155Bridgeable.sol";
import "../../src/UUPSProxied.sol";

/**
   @title ERC1155 with no supply support for testing.
*/
contract ERC1155NoSupply is ERC1155, UUPSOwnableProxied, IERC1155Bridgeable {

    /**
       @notice Default constructor, but intialize is used instead.
    */
    constructor()
        ERC1155("")
    { }

    /**
       @notice Initializes the implementation, only callable once.

       @param data Data to init the implementation.
    */
    function initialize(
        bytes calldata data
    )
        public
        onlyInit
    {
        (string memory uri_) = abi.decode(data, (string));

        _setURI(uri_);

        _transferOwnership(_msgSender());
    }

    /**
       @notice A free mint for testing.

       @param to The new owner.
       @param id The token type to mint.
       @param value Amount of the token.
    */
    function mintFree(
        address to,
        uint256 id,
        uint256 value
    )
        external
    {
        _mint(to, id, value, "");
    }

    /**
       @inheritdoc IERC1155Bridgeable

       @dev In this implementation, the owner is the bridge by default. So `onlyOwner`
       is enough.
    */
    function mintFromBridge(
        address to,
        uint256 id,
        uint256 value
    )
        public
        onlyOwner
    {
        _mint(to, id, value, "");
    }

    /**
       @inheritdoc IERC1155Bridgeable

       @dev In this implementation, the owner is the bridge by default. So `onlyOwner`
       is enough.
    */
    function burnFromBridge(
        address from,
        uint256 id,
        uint256 value
    )
        public
        onlyOwner
    {
        _burn(from, id, value);
    }

}
