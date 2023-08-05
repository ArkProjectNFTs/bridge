// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/proxy/utils/UUPSUpgradeable.sol";

/*
 * Convenient contract to have ownable UUPS proxied contract.
 */
contract UUPSOwnableProxied is Ownable, UUPSUpgradeable {

    // Mapping for implementations initialization.
    mapping(address implementation => bool initialized) _initializedImpls;

    // onlyInit
    modifier onlyInit() {
        address impl = _getImplementation();
        require(!_initializedImpls[impl], "Implementation already initialized.");
        _initializedImpls[impl] = true;

        _;
    }

    /*
     * Only owner should be able to upgrade.
     */
    function _authorizeUpgrade(address)
        internal
        override
        onlyOwner
    { }

    /*
     * Ensures unsupported function is directly reverted.
     */
    fallback()
        external
        payable {
        revert("unsupported");
    }

    /*
     * Ensures no ether is received without a function call.
     */
    receive()
        external
        payable { 
        revert("Kass does not accept assets");
    }
}

