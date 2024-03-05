// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IStarklaneEvent {

    /**
       @notice Request initiated on L1.
    */
    event DepositRequestInitiated(
        uint256 indexed hash,
        uint256 block_timestamp,
        uint256[] reqContent
    );

    /**
       @notice Request from L2 completed.
    */
    event WithdrawRequestCompleted(
        uint256 indexed hash,
        uint256 block_timestamp,
        uint256[] reqContent
    );

    /**
        @notice A request cancellation is started
    */
    event CancelRequestStarted(
        uint256 indexed hash,
        uint256 block_timestamp
    );

    /**
        @notice A request cancellation is completed
    */
    event CancelRequestCompleted(
        uint256 indexed hash,
        uint256 block_timestamp
    );

    /**
        @notice White list for deposit.
     */
    event WhiteListUpdated(
        bool enable
    );

    /**
        @notice White list status updated for collection.
     */
    event CollectionWhiteListUpdated(
        address indexed collection,
        bool enable
    );

    /**
        @notice L1 L2 collection mapping updated
     */
    event L1L2CollectionMappingUpdated(
        address indexed colllectionL1,
        uint256 indexed collectionL2
    );
}