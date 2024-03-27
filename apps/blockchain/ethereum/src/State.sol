// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./sn/Cairo.sol";

import "starknet/IStarknetMessaging.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 @title Starklane state.
*/
contract StarklaneState is Ownable {

    // StarknetCore.
    IStarknetMessaging _starknetCoreAddress;

    // Starklane L2 address for messaging.
    snaddress _starklaneL2Address;

    // Bridge L2 selector to deposit token from L1.
    felt252 _starklaneL2Selector;

    /**
       @notice Retrieves info about Starklane L2 mapping.

       @return (starklane L2 address, starklane L2 selector).
    */
    function l2Info()
        external
        view
        returns (snaddress, felt252)
    {
        return (_starklaneL2Address, _starklaneL2Selector);
    }

    /**
       @notice Sets Starklane L2 address.

       @param l2Address Starklane L2 address.
    */
    function setStarklaneL2Address(
        uint256 l2Address
    )
        public
        onlyOwner
    {
        _starklaneL2Address = Cairo.snaddressWrap(l2Address);
    }

    /**
       @notice Sets Starklane L2 selector of Starklane L2 contract to be
       called when a message arrives into Starknet.

       @param l2Selector Starklane L2 selector.
    */
    function setStarklaneL2Selector(
        uint256 l2Selector
    )
        public
        onlyOwner
    {
        _starklaneL2Selector = Cairo.felt252Wrap(l2Selector);
    }


}
