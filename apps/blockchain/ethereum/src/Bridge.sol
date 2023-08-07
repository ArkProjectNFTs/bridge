// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./sn/Cairo.sol";
import "./token/ERC721Bridgeable.sol";
import "./token/TokenUtil.sol";
import "./token/CollectionManager.sol";
import "./Protocol.sol";
import "./State.sol";
import "./Escrow.sol";
import "./Events.sol";
import "./UUPSProxied.sol";

import "starknet/IStarknetMessaging.sol";

/**
   @title Starklane bridge contract.
*/
contract Starklane is UUPSOwnableProxied, StarklaneState, StarklaneEvents, StarklaneEscrow, CollectionManager {

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

        _depositIntoEscrow(ctype, collectionL1, ownerL1, ids);

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
        uint256[] calldata data
    )
        external
        payable
    {

        Request memory req = Protocol.requestDeserialize(data, 0);

        // 1. Verify the request content + the type of claim and if it's valid.
        //    (quick claim, regular claim).

        address collectionL1 = _verifyRequestAddresses(req.collectionL1, req.collectionL2);

        // TODO: check for collection type to know which ERC is required...!
        CollectionType ctype = CollectionType.ERC721;

        if (collectionL1 == address(0x0)) {
            // TODO: add if for ERC1155.
            collectionL1 = _deployERC721Bridgeable(
                req.name,
                req.symbol,
                req.collectionL2,
                req.hash
            );
        }

        for (uint256 i = 0; i < req.tokenIds.length; i++) {
            uint256 id = req.tokenIds[i];

            bool wasEscrowed = _withdrawFromEscrow(ctype, collectionL1, req.ownerL1, id);

            if (!wasEscrowed) {
                // TODO: perhaps, implement the same interface for ERC721 and ERC1155..
                // As we only want to deal with UNIQ ones...!
                // BridgeableToken !!
                // Also, check what to do with URIs...!
                IERC721Bridgeable(collectionL1).mintFromBridge(req.ownerL1, id);
            }
        }
    }

}
