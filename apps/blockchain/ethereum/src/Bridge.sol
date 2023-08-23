// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./sn/Cairo.sol";
import "./token/ERC721Bridgeable.sol";
import "./token/TokenUtil.sol";
import "./token/CollectionManager.sol";
import "./Protocol.sol";
import "./State.sol";
import "./Escrow.sol";
import "./Messaging.sol";
import "./UUPSProxied.sol";

import "starknet/IStarknetMessaging.sol";

error NotSupportedYetError();
error CollectionMappingError();

/**
   @title Starklane bridge contract.
*/
contract Starklane is UUPSOwnableProxied, StarklaneState, StarklaneEscrow, StarklaneMessaging, CollectionManager {

    /**
       @notice Request initiated on L1.
    */
    event DepositRequestInitiated(
        uint256 indexed hash,
        uint256 block_timestamp,
        uint256[] reqContent
    );

    /**
       @notice Request initiated on L1.
    */
    event WithdrawRequestCompleted(
        uint256 indexed hash,
        uint256 block_timestamp,
        uint256[] reqContent
    );

    mapping(bytes32 => uint256) private l1ToL2Messages;
    mapping(bytes32 => uint256) private l1ToL2MessageCancellations;
    uint256 private messageCancellationDelay = 86400; 

    // Event to notify when message cancellation is started
    event MessageToL2CancellationStarted(
        address indexed sender,
        uint256 indexed toAddress,
        uint256 selector,
        uint256[] payload,
        uint256 nonce
    );

    // Event to notify when message cancellation is completed
    event MessageToL2Canceled(
        address indexed sender,
        uint256 indexed toAddress,
        uint256 selector,
        uint256[] payload,
        uint256 nonce
    );

    function getL1ToL2MsgHash(
    uint256 toAddress,
    uint256 selector,
    uint256[] calldata payload,
    uint256 nonce
) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(toAddress, selector, payload, nonce));
}


    function startL1ToL2MessageCancellation(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload,
        uint256 nonce
    ) external {
        emit MessageToL2CancellationStarted(msg.sender, toAddress, selector, payload, nonce);
        bytes32 msgHash = getL1ToL2MsgHash(toAddress, selector, payload, nonce);
        uint256 msgCount = l1ToL2Messages[msgHash];
        require(msgCount > 0, "NO_MESSAGE_TO_CANCEL");
        l1ToL2MessageCancellations[msgHash] = block.timestamp;
    }

    function cancelL1ToL2Message(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload,
        uint256 nonce
    ) external {
        emit MessageToL2Canceled(msg.sender, toAddress, selector, payload, nonce);
        bytes32 msgHash = getL1ToL2MsgHash(toAddress, selector, payload, nonce);
        uint256 msgCount = l1ToL2Messages[msgHash];
        require(msgCount > 0, "NO_MESSAGE_TO_CANCEL");

        uint256 requestTime = l1ToL2MessageCancellations[msgHash];
        require(requestTime != 0, "MESSAGE_CANCELLATION_NOT_REQUESTED");

        uint256 cancelAllowedTime = requestTime + messageCancellationDelay;
        require(cancelAllowedTime >= requestTime, "CANCEL_ALLOWED_TIME_OVERFLOW");
        require(block.timestamp >= cancelAllowedTime, "MESSAGE_CANCELLATION_NOT_ALLOWED_YET");

        l1ToL2Messages[msgHash] = msgCount - 1;
    }

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
        uint256[] calldata ids,
        bool useAutoBurn
    )
        external
        payable
    {
        CollectionType ctype = TokenUtil.detectInterface(collectionL1);
        if (ctype == CollectionType.ERC1155) {
            revert NotSupportedYetError();
        }

        Request memory req;

        // The withdraw auto is only available for request originated from
        // Starknet side as the withdraw on starknet is automatically done
        // by the sequencer.
        req.header = Protocol.requestHeaderV1(ctype, useAutoBurn, false);
        req.hash = Protocol.requestHash(salt, collectionL1, ownerL2, ids);
        // TODO: store request hash in storage to avoid replay attack.
        //       or can it be safe to use block timestamp? Not sure as
        //       several tx may have the exact same block.
        req.collectionL1 = collectionL1;
        req.collectionL2 = _l1ToL2Addresses[collectionL1];

        req.ownerL1 = msg.sender;
        req.ownerL2 = ownerL2;

        if (ctype == CollectionType.ERC721) {
            (req.name, req.symbol) = TokenUtil.erc721Metadata(
                collectionL1,
                ids
            );
        } else {
            (req.uri) = TokenUtil.erc1155Metadata(collectionL1);
        }

        _depositIntoEscrow(ctype, collectionL1, ids);

        req.tokenIds = ids;

        uint256[] memory payload = Protocol.requestSerialize(req);

        IStarknetMessaging(_starknetCoreAddress).sendMessageToL2{value: msg.value}(
            snaddress.unwrap(_starklaneL2Address),
            felt252.unwrap(_starklaneL2Selector),
            payload
        );

        emit DepositRequestInitiated(req.hash, block.timestamp, payload);
    }

    /**
       @notice Withdraw tokens received from L2.

       @param request Serialized request containing the tokens to be withdrawed. 

       @return Address of the collection targetted by the request (or newly deployed).
    */
    function withdrawTokens(
        uint256[] calldata request
    )
        external
        payable
        returns (address)
    {
        // Header is always the first uint256 of the serialized request.
        uint256 header = request[0];

        // Any error or permission fail in the message consumption will cause a revert.
        // After message being consumed, it is considered legit and tokens can be withdrawn.
        if (Protocol.canUseWithdrawAuto(header)) {
            _consumeMessageAutoWithdraw(_starklaneL2Address, request);
        } else {
            _consumeMessageStarknet(_starknetCoreAddress, _starklaneL2Address, request);
        }

        Request memory req = Protocol.requestDeserialize(request, 0);

        address collectionL1 = _verifyRequestAddresses(req.collectionL1, req.collectionL2);

        CollectionType ctype = Protocol.collectionTypeFromHeader(header);

        if (collectionL1 == address(0x0)) {
            if (ctype == CollectionType.ERC721) {
                collectionL1 = _deployERC721Bridgeable(
                    req.name,
                    req.symbol,
                    req.collectionL2,
                    req.hash
                );
            } else {
                // TODO ERC1155.
            }
        }

        for (uint256 i = 0; i < req.tokenIds.length; i++) {
            uint256 id = req.tokenIds[i];

            bool wasEscrowed = _withdrawFromEscrow(ctype, collectionL1, req.ownerL1, id);

            if (!wasEscrowed) {
                // TODO: perhaps, implement the same interface for ERC721 and ERC1155
                // As we only want to deal with ERC1155 token with value = 1.
                // Also, check what to do with URIs. If the URI storage is supported
                // or not for ERC721. If supported, we may need to mint with an URI.
                IERC721Bridgeable(collectionL1).mintFromBridge(req.ownerL1, id);
            }
        }

        emit WithdrawRequestCompleted(req.hash, block.timestamp, request);

        return collectionL1;
    }

}
