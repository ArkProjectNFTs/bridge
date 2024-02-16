// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "openzeppelin-contracts/contracts/token/ERC1155/IERC1155.sol";
import "openzeppelin-contracts/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import "openzeppelin-contracts/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "openzeppelin-contracts/contracts/utils/introspection/ERC165Checker.sol";

/**
   @notice Collection type that are supported by the bridge.
 */
enum CollectionType {
    ERC721,
    ERC1155
}

error UnsupportedTokenStandard();


/**
   @title Utils functions for token related stuff.
*/
library TokenUtil {

    /**
       @notice Detects the token contract interface.

       @param collection Address of the contract to be verified.

       @return CollectionType.
     */
    function detectInterface(
        address collection
    )
        internal
        view
        returns (CollectionType)
    {
        bool supportsERC721 = ERC165Checker.supportsInterface(
            collection,
            type(IERC721).interfaceId
        );

        if (supportsERC721) {
            return CollectionType.ERC721;
        }

        bool supportsERC1155 = ERC165Checker.supportsInterface(
            collection,
            type(IERC1155).interfaceId
        );

        if (supportsERC1155) {
            return CollectionType.ERC1155;
        }

        revert UnsupportedTokenStandard();
    }

    /**
       @notice Retrieves metadata from ERC721 token, if it supports it.

       @param collection Address of the ERC721 contract.
       @param tokenIds Ids of the tokens to get tokenURI from.

       @return (name, symbol, baseuri, tokenURIs).
     */
    function erc721Metadata(
        address collection,
        uint256[] memory tokenIds
    )
        internal
        view
        returns (string memory, string memory, string memory, string[] memory)
    {        
        bool supportsMetadata = ERC165Checker.supportsInterface(
            collection,
            type(IERC721Metadata).interfaceId
        );
        
        if (!supportsMetadata) {
            return ("", "", "", new string[](0));
        }

        IERC721Metadata c = IERC721Metadata(collection);
        // How the URI must be handled.
        // if a base URI is already present, we ignore individual URI
        // else, each token URI must be bridged and then the owner of the collection
        // can decide what to do
        (bool success, string memory _baseUri) = _callBaseUri(collection);
        if (success) {
            return (c.name(), c.symbol(), _baseUri, new string[](0));
        }
        else {
            string[] memory URIs = new string[](tokenIds.length);
            for (uint256 i = 0; i < tokenIds.length; i++) {
                URIs[i] = c.tokenURI(tokenIds[i]);
            }
            return (c.name(), c.symbol(), "", URIs);
        }
    }

    /**
       @notice Retrieves metadata from ERC1155, if it supports it.

       @param collection Address of the ERC1155 contract.

       @return baseURI.
     */
    function erc1155Metadata(
        address collection
    )
        internal
        view
        returns (string memory)
    {
        return "";
        /* bool supportsMetadata = ERC165Checker.supportsInterface( */
        /*     collection, */
        /*     type(IERC1155MetadataURI).interfaceId */
        /* ); */
        
        /* if (!supportsMetadata) { */
        /*     return ""; */
        /* } else { */
        /*     // TODO: ideally, we should get one URI of a token, */
        /*     // and extract the constant part? All tokens are supposed to have */
        /*     // the same base address, only replacing the `{id}`. If it's the case, */
        /*     // we can take the uri of the first token, and return it... */
        /*     //return IERC1155MetadataURI(collection).uri(WhichTokenId?); */
        /*     return "TODO"; */
        /* } */

    }

    function _callBaseUri(
        address collection
    )
        internal
        view
        returns (bool, string memory)
    {
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        bytes memory ret;
        bytes[2] memory encodedSignatures = [abi.encodeWithSignature("_baseUri()"), abi.encodeWithSignature("baseUri()")];

        for (uint256 i = 0; i < 2; i++) {
            bytes memory encodedParams = encodedSignatures[i];
            assembly {
                success := staticcall(gas(), collection, add(encodedParams, 0x20), mload(encodedParams), 0x00, 0x20)
                if success {
                    returnSize := returndatasize()
                    returnValue := mload(0x00)
                    ret := mload(0x40)
                    mstore(ret, returnSize)
                    returndatacopy(add(ret, 0x20), 0, returnSize)
                    // update free memory pointer
                    mstore(0x40, add(add(ret, 0x20), add(returnSize, 0x20)))
                }
            }
            if (success && returnSize >= 0x20 && returnValue > 0) {
                return (true, abi.decode(ret, (string)));
            }
        }
        return (false, "");
    }

}
