// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "./Deployer.sol";
import "../sn/Cairo.sol";

error InvalidCollectionL1Address();
error InvalidCollectionL2Address();
error ErrorVerifyingAddressMapping();
error CollectionMappingAlreadySet();

/**
   @title Collection manager to verify collection address matching and deploy them.
*/
contract CollectionManager {

    // Mapping between L2<->L1 contracts addresses.
    mapping(snaddress => address) _l2ToL1Addresses;

    // Mapping between L1<->L2 contracts addresses.
    mapping(address => snaddress) _l1ToL2Addresses;

    /**
       @notice A collection has been deployed due to the
       first token being bridged from L2.

       TODO: add the name and symbol here?
     */
    event CollectionDeployedFromL2(
        uint256 indexed reqHash,
        uint256 block_timestamp,
        address l1Address,
        uint256 l2Address
    );

    /**
       @notice Deploys ERC721Bridgeable contracts.

       @param name Descriptive name of the collection.
       @param symbol Abbreviated name of the collection.
       @param collectionL2 The collection's address on L2.
       @param reqHash Hash of the request.

       @return Address of the ERC721Bridgeable deployed (proxy address).
    */
    function _deployERC721Bridgeable(
        string memory name,
        string memory symbol,
        snaddress collectionL2,
        uint256 reqHash
    )
        internal
        returns (address)
    {
        address proxy = Deployer.deployERC721Bridgeable(name, symbol);
        _l1ToL2Addresses[proxy] = collectionL2;
        _l2ToL1Addresses[collectionL2] = proxy;

        emit CollectionDeployedFromL2(
            reqHash,
            block.timestamp,
            proxy,
            snaddress.unwrap(collectionL2)
        );

        return proxy;
    }

    /**
       @notice Deploys ERC1155Bridgeable contracts.

       @param uri URI with token placeholder.
       @param collectionL2 The collection's address on L2.
       @param reqHash Hash of the request.

       @return Address of the ERC1155Bridgeable deployed (proxy address).
    */
    function _deployERC1155Bridgeable(
        string memory uri,
        snaddress collectionL2,
        uint256 reqHash
    )
        internal
        returns (address)
    {
        address proxy = Deployer.deployERC1155Bridgeable(uri);
        _l1ToL2Addresses[proxy] = collectionL2;
        _l2ToL1Addresses[collectionL2] = proxy;

        emit CollectionDeployedFromL2(
            reqHash,
            block.timestamp,
            proxy,
            snaddress.unwrap(collectionL2)
        );

        return proxy;
    }

    /**
       @notice Verifies the mapping between the request addresses and the storage.

       @param collectionL1Req The collection on L1 from the request.
       @param collectionL2Req The collection on L2 from the request.

       @return Address of the already deployed collection on L1, address(0) otherwise.
    */
    function _verifyRequestAddresses(
        address collectionL1Req,
        snaddress collectionL2Req
    )
        internal
        view
        returns (address)
    {
        address l1Req = collectionL1Req;
        uint256 l2Req = snaddress.unwrap(collectionL2Req);
        address l1Mapping = _l2ToL1Addresses[collectionL2Req];
        uint256 l2Mapping = snaddress.unwrap(_l1ToL2Addresses[l1Req]);

        // L2 address is present in the request and L1 address is not.
        if (l2Req > 0 && l1Req == address(0)) {
            if (l1Mapping == address(0)) {
                // It's the first token of the collection to be bridged.
                return address(0);
            } else {
                // It's not the first token of the collection to be bridged,
                // and the collection tokens were only bridged L2->L1.
                return l1Mapping;
            }
        }

        // L2 address is present, and L1 address too.
        if (l2Req > 0 && l1Req > address(0)) {
            if (l1Mapping != l1Req) {
                revert InvalidCollectionL1Address();
            } else if (l2Mapping != l2Req) {
                revert InvalidCollectionL2Address();
            } else {
                // All addresses match, we don't need to deploy anything.
                return l1Mapping;
            }
        }

        revert ErrorVerifyingAddressMapping();
    }

    function _setL1L2AddressMapping(
        address collectionL1,
        snaddress collectionL2,
        bool force
    )
        internal
    {
        if (((snaddress.unwrap(_l1ToL2Addresses[collectionL1]) == 0) && (_l2ToL1Addresses[collectionL2] == address(0)))
            || (force == true)) {
            _l1ToL2Addresses[collectionL1] = collectionL2;
            _l2ToL1Addresses[collectionL2] = collectionL1;
        } else {
            revert CollectionMappingAlreadySet();
        }
    }

}

