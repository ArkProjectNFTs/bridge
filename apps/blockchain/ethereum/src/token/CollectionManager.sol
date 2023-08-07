// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "./ERC721Bridgeable.sol";
import "../sn/Cairo.sol";


/**
   @title Collection manager to verify collection address matching and deploy them.
*/
contract CollectionManager {

    // Mapping between L2<->L1 contracts addresses.
    mapping(snaddress => address) _l2ToL1Addresses;

    // Mapping between L1<->L2 contracts addresses.
    mapping(address => snaddress) _l1ToL2Addresses;

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
        felt252 reqHash
    )
        internal
        returns (address)
    {
        address impl = address(new ERC721Bridgeable());
        
        bytes memory dataInit = abi.encodeWithSelector(
            ERC721Bridgeable.initialize.selector,
            abi.encode(name, symbol)
        );

        address proxy = address(new ERC1967Proxy(impl, dataInit));

        _l1ToL2Addresses[proxy] = collectionL2;

        // TODO: Emit event with reqHash.

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
                revert("Invalid collection L1 address.");
            } else if (l2Mapping != l2Req) {
                revert("Invalid collection L2 address.");
            } else {
                // All addresses match, we don't need to deploy anything.
                return l1Mapping;
            }
        }

        revert("Error verifying addresses mapping.");
    }

}

