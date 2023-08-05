// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

import "./IERC721Bridgeable.sol";
import "./UUPSProxied.sol";

/*
 * ERC721 that can be minted by the bridge.
 *
 * NOTE: As this ERC721 must be upgradable, the name and symbol must
 * be overriden to work correctly, as the constructor can't be called,
 * but initialization function instead.
 */
contract ERC721Bridgeable is ERC721, UUPSOwnableProxied, IERC721Bridgeable {

    //
    string private _name;

    //
    string private _symbol;

    /*
     * Intialize used instead.
     */
    constructor()
        ERC721("", "")
    { }

    //
    function testMintRange(address to, uint256 tokenIdStart, uint256 tokenIdEnd)
        external {

        require(tokenIdStart < tokenIdEnd, "Bad range");
        uint256 id = tokenIdStart;
        for (id; id <= tokenIdEnd; id++) {
            _mint(to, id);
        }
    }

    /*
     * In this implementation, the owner is the bridge by default. So `onlyOwner`
     * is enough.
     */
    function mintFromBridge(address to, uint256 tokenId)
        public
        onlyOwner {

        _mint(to, tokenId);
    }

    /*
     * In this implementation, the owner is the bridge by default. So `onlyOwner`
     * is enough.
     */
    function burnFromBridge(uint256 id)
        public
        onlyOwner {

        _burn(id);
    }

    /*
     * Initializes the implementation.
     */
    function initialize(bytes calldata data)
        public
        onlyInit
    {
        (string memory n, string memory s) = abi.decode(data, (string, string));

        _name = n;
        _symbol = s;

        _transferOwnership(_msgSender());
    }

    /*
     * By default empty, or perhaps we can target a default URI?
     */
    function _baseURI()
        internal
        pure
        override
        returns (string memory) {
        return "";
    }

    /*
     *
     */
    function name()
        public
        view
        override
        returns (string memory) {

        return _name;
    }

    /*
     *
     */
    function symbol()
        public
        view
        override
        returns (string memory) {

        return _symbol;
    }
}

