// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

import "./IERC721Bridgeable.sol";
import "../UUPSProxied.sol";

/**
   @title ERC721 that can be minted by the bridge.
 
   @dev As this ERC721 must be upgradable, the name and symbol must
   be overriden to work correctly, as the constructor can't be called,
   but initialization function instead.
*/
contract ERC721Bridgeable is ERC721, UUPSOwnableProxied, IERC721Bridgeable {

    // Descriptive name for the token collection.
    string private _name;

    // Abbreviated name for the token collection.
    string private _symbol;

    /**
       @notice Default constructor, but intialize is used instead.
    */
    constructor()
        ERC721("", "")
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
        (string memory n, string memory s) = abi.decode(data, (string, string));

        _name = n;
        _symbol = s;

        _transferOwnership(_msgSender());
    }

    /**
       @inheritdoc IERC721Bridgeable

       @dev In this implementation, the owner is the bridge by default. So `onlyOwner`
       is enough.
    */
    function mintFromBridge(address to, uint256 id)
        public
        onlyOwner {

        _mint(to, id);
    }

    /**
       @inheritdoc IERC721Bridgeable

       @dev In this implementation, the owner is the bridge by default. So `onlyOwner`
       is enough.
    */
    function burnFromBridge(uint256 id)
        public
        onlyOwner {

        _burn(id);
    }

    /**
       @notice base URI for the tokens.

       @dev By default empty, or perhaps we can target a default URI?
    */
    function _baseURI()
        internal
        pure
        override
        returns (string memory) {
        return "";
    }

    /**
       @notice A descriptive name for the token collection.

       @dev `name()` must be overriden as the underlying value
       is private, then not accessible for this contract (which extends
       the base ERC721 contract).
    */
    function name()
        public
        view
        override
        returns (string memory)
    {
        return _name;
    }

    /**
       @notice An abbreviated name for the token collection.

       @dev `symbol()` must be overriden as the underlying value
       is private, then not accessible for this contract (which extends
       the base ERC721 contract).
    */
    function symbol()
        public
        view
        override
        returns (string memory)
    {
        return _symbol;
    }
}

