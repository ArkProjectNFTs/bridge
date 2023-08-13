// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC1155/IERC1155.sol";

import "./token/TokenUtil.sol";

/**
   @title Contract responsible of escrowing tokens.
*/
contract StarklaneEscrow is Context {

    // Escrowed token.
    // Mapping (collectionAddres => (tokenId => depositor)).
    mapping(address => mapping(uint256 => address)) _escrow;

    /**
       @notice Deposits the given tokens into escrow.

       @param collectionType The token type,
       @param collection Token collection address.
       @param ids Tokens to be deposited.
     */
    function _depositIntoEscrow(
        CollectionType collectionType,
        address collection,
        uint256[] memory ids
    )
        internal
    {
        assert(ids.length > 0);

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];

            if (collectionType == CollectionType.ERC721) {
                IERC721(collection).transferFrom(msg.sender, address(this), id);
            } else {
                // TODO: check the supply is exactly one.
                // (this is the low level call to verify if a contract has some function).
                // (but it's better to check with supported interfaces? It's 2 calls instead
                // of one where we control the fail.)
                //(bool success, bytes memory data) = contractAddress.call("");
                IERC1155(collection).safeTransferFrom(msg.sender, address(this), id, 1, "");
            }

            _escrow[collection][id] = msg.sender;
        }
    }

    /**
       @notice Withdraw a token from escrow.

       @param collectionType The token type,
       @param collection Token collection address.
       @param to Owner withdrawing the token.
       @param id Token to be deposited.

       @return True if the token was into escrow, false otherwise.
     */
    function _withdrawFromEscrow(
        CollectionType collectionType,
        address collection,
        address to,
        uint256 id
    )
        internal
        returns (bool)
    {
        if (!_isEscrowed(collection, id)) {
            return false;
        }

        address from = address(this);

        if (collectionType == CollectionType.ERC721) {
            IERC721(collection).safeTransferFrom(from, to, id);
        } else {
            // TODO:
            // Check here if the token supply is currently 0.
            IERC1155(collection).safeTransferFrom(from, to, id, 1, "");
        }

        _escrow[collection][id] = address(0x0);

        return true;
    }

    /**
       @notice Verifies if the given token is in escrow.

       @param collection Token collection address.
       @param id Token id.

       @return True if the token is in escrow, false otherwise.
     */
    function _isEscrowed(
        address collection,
        uint256 id
    )
        internal
        view
        returns (bool)
    {
        return _escrow[collection][id] > address(0x0);
    }

}
