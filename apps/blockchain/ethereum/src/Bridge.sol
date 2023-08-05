// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./sn/Cairo.sol";
import "./token/ERC721Bridgeable.sol";
import "./token/TokenUtil.sol";
import "./Protocol.sol";
import "./State.sol";
import "./Escrow.sol";
import "./Events.sol";
import "./UUPSProxied.sol";

import "starknet/IStarknetMessaging.sol";

/**
   @title Starklane bridge contract.
 */
contract Starklane is UUPSOwnableProxied, StarklaneState, StarklaneEvents, StarklaneEscrow {

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
       @param collectionL1 Address of the collection contract.
       @param ownerL2 New owner address on Starknet.
       @param ids Ids of the token to transfer. At least 1 token is required.
    */
    function depositTokens(
        uint256 salt,
        address collectionL1,
        snaddress ownerL2,
        uint256[] calldata ids
    )
        external
        payable
    {
        require(collectionL1 > address(0), "Bad contract L1 address.");
        require(salt != 0, "Request salt must be greater that 0.");
        require(ids.length > 0, "At least one token must be bridged.");

        CollectionType ctype = TokenUtil.detectInterface(collectionL1);
        if (ctype == CollectionType.ERC1155) {
            revert("ERC1155: not supported yet, work in progress.");
        }

        Request memory req;

        req.header = Protocol.requestHeaderV1(ctype);
        req.hash = Protocol.requestHash(salt, collectionL1, ownerL2, ids);
        req.collectionL1 = collectionL1;
        req.collectionL2 = _l1ToL2Addresses[collectionL1];

        address ownerL1 = _msgSender();
        req.ownerL1 = ownerL1;
        req.ownerL2 = ownerL2;

        if (ctype == CollectionType.ERC721) {
            (req.name, req.symbol, req.tokenURIs) = TokenUtil.erc721Metadata(
                collectionL1,
                ids
            );
        } else {
            (req.uri) = TokenUtil.erc1155Metadata(collectionL1);
        }

        depositIntoEscrow(ctype, collectionL1, ownerL1, ids);

        uint256[] memory payload = Protocol.requestSerialize(req);

        IStarknetMessaging(_starknetCoreAddress).sendMessageToL2{value: msg.value}(
            snaddress.unwrap(_starklaneL2Address),
            felt252.unwrap(_starklaneL2Selector),
            payload
        );

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
