// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/*
 * ERC721 that can be bridged.
 */
contract ERC721Bridgeable is ERC721URIStorage, Ownable {

    //
    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {
        _transferOwnership(msg.sender);
    }

    //
    function testMint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
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
