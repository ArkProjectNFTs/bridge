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
        snaddress toL2Address,
        uint256[] calldata tokenIds,
        uint256[] calldata tokenValues
    )
        external
        payable
    {
        require(contractAddress > address(0), "Bad contract L1 address.");
        require(salt != 0, "Request salt must be greater that 0.");
        require(tokenIds.length > 0, "At least one token must be bridged.");

        CollectionType intf = TokenUtil.detectInterface(contractAddress);
        if (intf == CollectionType.ERC1155) {
            revert("ERC1155: not supported yet, work in progress.");
        }

        Request memory req;

        req.header = Protocol.requestHeaderV1(intf);
        req.hash = Protocol.requestHash(salt, contractAddress, toL2Address, tokenIds);
        req.contractL1Address = contractAddress;
        req.contractL2Address = _l1ToL2Addresses[contractAddress];

        if (intf == CollectionType.ERC721) {
            (req.name, req.symbol, req.tokenURIs) = TokenUtil.erc721Metadata(
                contractAddress,
                tokenIds
            );
        } else {
            (req.uri) = TokenUtil.erc1155Metadata(contractAddress);
        }

        req.ownerL1Address = _msgSender();
        req.ownerL2Address = toL2Address;

        // Escrow tokens.

        // Send request.
        /* uint256[] memory payload = Protocol.bridgeRequestSerialize(req); */

        /* IStarknetMessaging(_starknetCore).sendMessageToL2{value: msg.value} */
        /* (_bridgeL2Address, _bridgeL2Selector, payload); */

        // Emit event.
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
