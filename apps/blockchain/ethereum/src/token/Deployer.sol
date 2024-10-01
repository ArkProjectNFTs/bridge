// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "openzeppelin-contracts/contracts/utils/Create2.sol";
import "openzeppelin-contracts/contracts/utils/Address.sol";

import "./ERC721Bridgeable.sol";
import "./ERC1155Bridgeable.sol";

/**
   @title Collection contract deployer.
*/
 library Deployer {

    // Error message
    error AlreadyDeployed();
    /**
       @notice Deploys a UUPS proxied ERC721 contract.

       @param name Descriptive name for the token collection.
       @param symbol Abbreviated name for the token collection.

       @return Address of the proxy.
    */
 
    function deployERC721Bridgeable(
        string memory name,
        string memory symbol
    )
        public
        returns (address)
    {
        bytes32 salt = keccak256(abi.encodePacked(name, symbol));
        bytes memory bytecode = type(ERC721Bridgeable).creationCode;
        address precomputedImpl = Create2.computeAddress(salt, keccak256(bytecode));

        if (Address.isContract(precomputedImpl)) {
            revert AlreadyDeployed();
        }

        address impl = address(new ERC721Bridgeable{salt: salt}());
        
        
        bytes memory dataInit = abi.encodeWithSelector(
            ERC721Bridgeable.initialize.selector,
            abi.encode(name, symbol)
        );

        return address(new ERC1967Proxy(impl, dataInit));
    }

    /**
       @notice Deploys a UUPS proxied ERC1155 contract.

       @param uri URI with token id placeholder.

       @return Address of the proxy.
    */
    function deployERC1155Bridgeable(
        string memory uri
    )
        public
        returns (address)
    {
        bytes32 salt = keccak256(abi.encodePacked(uri));
        bytes memory bytecode = type(ERC721Bridgeable).creationCode;
        address precomputedImpl = Create2.computeAddress(salt, keccak256(bytecode));

        if (Address.isContract(precomputedImpl)) {
            revert AlreadyDeployed();
        }
        address impl = address(new ERC1155Bridgeable{salt: salt}());
   
        
        bytes memory dataInit = abi.encodeWithSelector(
            ERC1155Bridgeable.initialize.selector,
            abi.encode(uri)
        );

        return address(new ERC1967Proxy(impl, dataInit));
    }



}
