// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./sn/Cairo.sol";
import "./token/ERC721Bridgeable.sol";
import "./token/TokenUtil.sol";
import "./Protocol.sol";
import "./State.sol";
import "./Events.sol";
import "./UUPSProxied.sol";

import "starknet/IStarknetMessaging.sol";

/**
   @title Starklane bridge contract.
 */
contract Starklane is UUPSOwnableProxied, StarklaneState, StarklaneEvents {

    /**
      @notice Initializes the implementation, only callable once.

      @param data Data to init the implementation.
     */
    function initialize(
        bytes calldata data
    )
        public
        onlyInit
    {
        (
            address owner,
            IStarknetMessaging starknetCoreAddress,
            uint256 starklaneL2Address,
            uint256 starklaneL2Selector
        ) = abi.decode(
            data,
            (address, IStarknetMessaging, uint256, uint256)
        );

        _starknetCoreAddress = starknetCoreAddress;

        _transferOwnership(owner);

        setStarklaneL2Address(Cairo.snaddressWrap(starklaneL2Address));
        setStarklaneL2Selector(Cairo.felt252Wrap(starklaneL2Selector));
    }

    /**
       @notice Deposits token in escrow and initiates the
       transfer to Starknet. Will revert if any of the token is missing approval
       for the bridge as operator.

       @param salt A salt used to generate the request hash.
       @param contractAddress Address of the token contract.
       @param toL2Address New owner address on Starknet.
       @param tokenIds Ids of the token to transfer. At least 1 token is required.
       @param tokenValues Values (amount) for each token. Applies for ERC1155 only.
       If empty, this is like providing the value `1` for each token. If
       not empty, the length must match the `tokenIds` length.
    */
    function depositTokens(
        uint256 salt,
        address contractAddress,
        felt252 toL2Address,
        uint256[] calldata tokenIds,
        uint256[] calldata tokenValues
    )
        external
        payable
    {
        TokenContractInterface intf = TokenUtil.detectInterface(contractAddress);
        require(
            intf != TokenContractInterface.OTHER,
            "Only ERC721 and ERC1155 are supported."
        );
        
    }

    /**
       @notice Claims tokens received from L2.
     */
    function claimTokens(
        uint256 fromAddress,
        uint256[] calldata bridgeRequest
    )
        external
        payable
    {

    }

}
