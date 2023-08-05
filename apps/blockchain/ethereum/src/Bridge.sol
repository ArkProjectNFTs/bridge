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
       @param collection Address of the collection contract.
       @param toL2Address New owner address on Starknet.
       @param ids Ids of the token to transfer. At least 1 token is required.
    */
    function depositTokens(
        uint256 salt,
        address collection,
        snaddress toL2Address,
        uint256[] calldata ids
    )
        external
        payable
    {
        require(collection > address(0), "Bad contract L1 address.");
        require(salt != 0, "Request salt must be greater that 0.");
        require(ids.length > 0, "At least one token must be bridged.");

        CollectionType ctype = TokenUtil.detectInterface(collection);
        if (ctype == CollectionType.ERC1155) {
            revert("ERC1155: not supported yet, work in progress.");
        }

        Request memory req;

        req.header = Protocol.requestHeaderV1(ctype);
        req.hash = Protocol.requestHash(salt, collection, toL2Address, ids);
        req.contractL1Address = collection;
        req.contractL2Address = _l1ToL2Addresses[collection];

        if (ctype == CollectionType.ERC721) {
            (req.name, req.symbol, req.tokenURIs) = TokenUtil.erc721Metadata(
                collection,
                ids
            );
        } else {
            (req.uri) = TokenUtil.erc1155Metadata(collection);
        }

        req.ownerL1Address = _msgSender();
        req.ownerL2Address = toL2Address;

        depositIntoEscrow(ctype, collection, _msgSender(), ids);

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
