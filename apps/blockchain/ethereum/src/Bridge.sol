// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Cairo.sol";
import "./Protocol.sol";
import "./ERC721Bridgeable.sol";
import "./State.sol";
import "./Events.sol";

import "starknet/IStarknetMessaging.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/*
 * Starklane bridge contract.
 */
contract Starklane is Ownable, StarklaneState, StarklaneEvents {

    //
    bool _isInitialized;

    /*
     * Initializes Starklane, only callable once.
     */
    function initialize(bytes calldata data) public {
        require(!_isInitialized, "Already initialized.");
        _isInitialized = true;

        (
            address owner,
            IStarknetMessaging starknetCore,
            uint256 starklaneL2Address,
            uint256 starklaneL2Selector
        ) = abi.decode(
            data,
            (address, IStarknetMessaging, uint256, uint256)
        );

        _starknetCore = starknetCore;

        setStarklaneL2Address(Cairo.snaddressWrap(starklaneL2Address));
        setStarklaneL2Selector(Cairo.felt252Wrap(starklaneL2Selector));

        _transferOwnership(owner);
    }

    /*
     * TODO: check what's better for the UX.
     * but this implies a transaction. And we will not pay for everybody...
     * We can batch the incoming requests, and then notify users?
     */
    function claimTokens(uint256 fromAddress, uint256[] calldata bridgeRequest)
        external
        payable {

    }

    /*
     * Deposit token in escrow and initiates the
     * transfer to Starknet.
     *
     * Will revert if any of the token is missing approval
     * for the bridge as operator.
     *
     * TODO: add the amounts uint256[] to also support ERC1155.
     * this array must be empty if the collection if ERC721.
     * If ERC1155 -> length must match the tokensIds length.
     */
    function depositTokens(
        felt252 reqHash,
        address collectionAddress,
        felt252 ownerL2Address,
        uint256[] calldata tokensIds)
        external
        payable {


    }

}
