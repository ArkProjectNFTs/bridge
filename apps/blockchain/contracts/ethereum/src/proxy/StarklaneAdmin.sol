// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/StorageSlot.sol";
import "openzeppelin-contracts/contracts/utils/Address.sol";

/*
 *
 */
contract StarklaneProxy is Ownable {

    bytes32 private constant _IMPLEMENTATION_SLOT = 0x477a7d3390036288ec6f7ddd9da4b02d6b661689013164e3fff264a6652f82db;

    /*
     * Emitted when the implementation is upgraded.
     */
    event Upgraded(address indexed implementation);

    /*
     *
     */
    constructor(address logic) {
        _transferOwnership(msg.sender);
        _setImplementation(logic);
    }

    /*
     * Returns the current implementation address.
     */
    function getImplementation() external view returns (address) {
        return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
    }

    /*
     * Stores a new address in the implementation slot.
     */
    function setImplementation(address newImplementation) external onlyOwner {
        _setImplementation(newImplementation);
    }

    /*
     *
     */
    function _setImplementation(address newImplementation) internal {
        require(Address.isContract(newImplementation), "new implementation is not a contract");
        StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
        emit Upgraded(newImplementation);
    }

    /*
     *
     */
    function _fallback() internal virtual {
        address implementation = StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;

        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
