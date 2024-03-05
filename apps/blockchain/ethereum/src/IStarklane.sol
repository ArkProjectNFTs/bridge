// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./sn/Cairo.sol";

/**
 */
interface IStarklane {
    /**
       @notice Deposits token in escrow and initiates the
       transfer to Starknet. Will revert if any of the token is missing approval
       for the bridge as operator.

       @param salt A salt used to generate the request hash.
       @param collectionL1 Address of the collection contract.
       @param ownerL2 New owner address on Starknet.
       @param ids Ids of the token to transfer. At least 1 token is required.
       @param useAutoBurn If true, ensures the token is burnt after being bridged.
    */
    function depositTokens(
        uint256 salt,
        address collectionL1,
        snaddress ownerL2,
        uint256[] calldata ids,
        bool useAutoBurn
    )
        external
        payable;

    /**
       @notice Withdraw tokens received from L2.

       @param request Serialized request containing the tokens to be withdrawed. 
    */
    function withdrawTokens(
        uint256[] calldata request
    )
        external
        payable
        returns (address);

    /**
        @notice Start the cancellation of a given request.
     
        @param payload Request to cancel
        @param nonce Nonce used for request sending.
     */
    function startRequestCancellation(
        uint256[] memory payload,
        uint256 nonce
    ) external;

    /**
        @notice Cancel a given request.

        @param payload Request to cancel
        @param nonce Nonce used for request sending.
     */
    function cancelRequest(
        uint256[] memory payload,
        uint256 nonce
    ) external;

    /**
       @notice Adds the hash of a message that can be consumed with the auto
       method.

       @param msgHash Hash of the message to be considered as consumable.
    */
    function addMessageHashForAutoWithdraw(
        uint256 msgHash
    )
        external
        payable;

    /**
     */
    function l2Info()
        external
        returns (snaddress, felt252);
    
    /**
        @notice Enable whitelist for deposit

        @param enable enabled if true
     */
    function enableWhiteList(
        bool enable
    ) external;

    /**
        @notice Update whitelist status for given collection

        @param collection Collection address
        @param enable white list is enabled if true
     */
    function whiteList(
        address collection, 
        bool enable
    ) external;

    /**
     * @return true if white list is enabled
     */
    function isWhiteListEnabled() external view returns (bool);

    /**
     * @return true if given collection is white listed
     */
    function isWhiteListed(address collection) external view returns (bool);

    /**
     * @return array of white listed collections
     */
    function getWhiteListedCollections() external view returns (address[] memory);

    /**
        @notice Enable bridge

        @param enable enabled if true
     */
    function enableBridge(
        bool enable
    ) external;

    /**
     * @return true if bridge is enabled
     */
    function isEnabled() external view returns (bool);

    /**
     * 
     * @param collectionL1 Collection address on L1
     * @param collectionL2 Collection address on L2
     * @param force Force flag
     */
    function setL1L2CollectionMapping(
        address collectionL1,
        snaddress collectionL2,
        bool force
    ) external;

}
