// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/proxy/utils/UUPSUpgradeable.sol";

error NotSupportedError();
error NotPayableError();

/**
   @title Convenient contract to have ownable UUPS proxied contract.
*/
contract UUPSOwnableProxied is Ownable, UUPSUpgradeable {

    // Mapping for implementations initialization.
    mapping(address implementation => bool initialized) _initializedImpls;

    // onlyInit
    modifier onlyInit() {
        address impl = _getImplementation();
        require(!_initializedImpls[impl], "Already init");
        _initializedImpls[impl] = true;

        _;
    }

    /**
       @notice Only owner should be able to upgrade.
    */
    function _authorizeUpgrade(
        address
    )
        internal
        override
        onlyOwner
    { }

    /**
       @notice Ensures unsupported function is directly reverted.
    */
    fallback()
        external
        payable
        {
            revert NotSupportedError();
        }

    /**
       @notice Ensures no ether is received without a function call.
    */
    receive()
        external
        payable
        {
            revert NotPayableError();
        }
}

