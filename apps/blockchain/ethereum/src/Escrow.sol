// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC1155/IERC1155.sol";

import "./token/TokenUtil.sol";

/**
   @title Contract responsible of escrowing tokens.
*/
contract StarklaneEscrow {

    // Escrowed token.
    // Mapping (collectionAddres => (tokenId => depositor)).
    mapping(address => mapping(uint256 => address)) _escrow;

    /**
       @notice Gathers the escrow status for each token.

       @param collection Token collection address.
       @param ids Tokens to be checked.

       @return Array of bools (true if escrowed, false otherwise).
    */
    function escrowStatuses(
        address collection,
        uint256[] calldata ids
    )
        external
        view
        returns (bool[] memory)
    {
        bool[] memory res = new bool[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            res[i] = _isEscrowed(collection, ids[i]);
        }

        return res;
    }

    /**
       @notice Deposits the given tokens into escrow.

       @param tokenType The token type,
       @param collection Token collection address.
       @param from Owner depositing the tokens.
       @param ids Tokens to be deposited.
     */
    function depositIntoEscrow(
        CollectionType tokenType,
        address collection,
        address from,
        uint256[] memory ids
    )
        internal
    {
        address to = address(this);

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];

            if (tokenType == CollectionType.ERC721) {
                IERC721(collection).safeTransferFrom(from, to, id);
            } else {
                // We need here 3 calls.... 1) check the existence of token.
                // 2) check the supply is exactly one.
                // 3) transfert.
                //(bool success, bytes memory data) = contractAddress.call("");
                // but.. token can be minted again so... No sure it makes a lot of sense
                // to bridge them.
                IERC1155(collection).safeTransferFrom(from, to, id, 1, "");
            }

            _escrow[collection][id] = from;
        }
    }

    /**
       @notice Withdraw a token from escrow.

       @param tokenType The token type,
       @param collection Token collection address.
       @param to Owner withdrawing the token.
       @param id Token to be deposited.

       @return True if the token was into escrow, false otherwise.
     */
    function withdrawFromEscrow(
        CollectionType tokenType,
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

        if (tokenType == CollectionType.ERC721) {
            IERC721(collection).safeTransferFrom(from, to, id);
        } else {
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
