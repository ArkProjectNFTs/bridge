// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "./IERC721MintRangeFree.sol";

/**
   @title ERC721 with free mint.
*/
contract ERC721MintFree is ERC721, IERC721MintRangeFree {

    /**
       @notice Default constructor, but intialize is used instead.
    */
    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    { }

    /**
       @notice A free minting for testing.
    */
    function mintRangeFree(
        address to,
        uint256 idStart,
        uint256 idEnd
    )
        external
    {
        require(idStart < idEnd, "Bad range");

        uint256 id = idStart;

        for (id; id <= idEnd; id++) {
            _mint(to, id);
        }
    }
}

