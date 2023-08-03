// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/*
 * ERC721 that can be bridged.
 *
 * -> Don't use ERC721URIStorage but ERC721 and use baseURI
 * override     function _baseURI() internal view virtual returns (string memory) {
        return "";
    }
    To return something concatenated with the base URI for each token.
 */
contract ERC721Bridgeable is ERC721URIStorage, Ownable {

    //
    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {
        //_transferOwnership(msg.sender);
    }

    //
    function testMint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    //
    function testMintRange(address to, uint256 tokenIdStart, uint256 tokenIdEnd) public {
        require(tokenIdStart < tokenIdEnd, "Bad range");
        uint256 id = tokenIdStart;
        for (id; id < tokenIdEnd; id++) {
            _mint(to, id);
        }
    }

    //
    function permissionedMint(
        address to,
        uint256 tokenId,
        string memory tokenURI)
        public onlyOwner {
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }
}
