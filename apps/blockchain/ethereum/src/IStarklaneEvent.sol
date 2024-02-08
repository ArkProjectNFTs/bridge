// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IStarklaneEvent {
    /**
        @notice White list for deposit.
     */
    event WhiteListUpdated(
        bool enable
    );

    /**
        @notice White list status updated for collection
     */
    event CollectionWhiteListUpdated(
        address indexed collection,
        bool enable
    );
}