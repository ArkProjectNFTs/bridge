// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./sn/Cairo.sol";
import "./token/TokenUtil.sol";

/**
   @notice Request to bridge tokens.
*/
struct Request {
    felt252 header;
    uint256 hash;

    address collectionL1;
    snaddress collectionL2;

    address ownerL1;
    snaddress ownerL2;

    string name;
    string symbol;
    string uri;

    uint256[] tokenIds;
    uint256[] tokenValues;
    string[] tokenURIs;
    uint256[] newOwners;
}

error CollectionTypeMaskUnsupported();

/**
   @title Library related to the protocol for bridging tokens.
*/
library Protocol {

    // Byte 0 of the header: Version.
    uint256 private constant HEADER_V1 = 0x01;

    // Byte 1 of the header: Collection type.
    uint256 private constant COLLECTION_TYPE_MASK = (0xff << (8 * 1));
    uint256 private constant ERC721_TYPE = (0x01 << (8 * 1));
    uint256 private constant ERC1155_TYPE = (0x02 << (8 * 1));

    // Byte 2 of the header: deposit config.
    uint256 private constant DEPOSIT_AUTO_BURN = (0x01 << (8 * 2));

    // Byte 3 of the header: withdraw config.
    uint256 private constant WITHDRAW_AUTO = (0x01 << (8 * 3));

    /**
       @notice Verifies if the given header supports the withdraw auto.

       @return True if withdraw auto is supported, false otherwise.
    */
    function canUseWithdrawAuto(
        uint256 header
    )
        internal
        pure
        returns (bool)
    {
        return (header & WITHDRAW_AUTO) == WITHDRAW_AUTO;
    }

    /**
       @notice Retrieves the collection type from the header.

       @return Collection type found in the header.
    */
    function collectionTypeFromHeader(
        uint256 header
    )
        internal
        pure
        returns (CollectionType)
    {
        uint256 ct = header & COLLECTION_TYPE_MASK;
        if (ct == ERC721_TYPE) {
            return CollectionType.ERC721;
        } else if (ct == ERC1155_TYPE)  {
            return CollectionType.ERC1155;
        } else {
            revert CollectionTypeMaskUnsupported();
        }
    }

    /**
       @notice Computes the V1 header value.

       @dev Header is a felt252 (31 bits).
       Byte 0 is the version (0x1).
       Byte 1 is the contract interface (0x1 = ERC721, 0x2 = ERC1155).
       Byte 2 is the deposit config.
       Byte 3 is the withdraw config.

       @param ctype The collection type.
    */
    function requestHeaderV1(
        CollectionType ctype,
        bool useDepositAutoBurn,
        bool useWithdrawAuto
    )
        internal
        pure
        returns (felt252)
    {
        uint256 h = HEADER_V1;

        if (ctype == CollectionType.ERC721) {
            h |= ERC721_TYPE;
        } else {
            h |= ERC1155_TYPE;
        }

        if (useDepositAutoBurn) {
            h |= DEPOSIT_AUTO_BURN;
        }
        
        if (useWithdrawAuto) {
            h |= WITHDRAW_AUTO;
        }

        return Cairo.felt252Wrap(h);
    }

    /**
       @notice Computes the request hash.

       @param salt Random salt.
       @param collection Token collection contract address (L1).
       @param toL2Address New owner on Starknet (L2).
       @param tokenIds List of token ids to be transfered.

       @return Request hash.
    */
    function requestHash(
        uint256 salt,
        address collection,
        snaddress toL2Address,
        uint256[] memory tokenIds
    )
        internal
        pure
        returns (uint256)
    {
        bytes32 hash = keccak256(
            abi.encodePacked(
                salt,
                // Cairo uses felts, which are converted into u256 to compute keccak.
                // As we use abi.encodePacked, we want the address to also be 32 bytes long.
                uint256(uint160(collection)),
                snaddress.unwrap(toL2Address),
                tokenIds
            )
        );

        return uint256(hash);
    }

    /**
       @notice Computes the serialized length of a request.

       @param req Request of which the length is computed.

       @return Length of the uint256[] that can contain the serialized request.
    */
    function requestSerializedLength(
        Request memory req
    )
        internal
        pure
        returns (uint256)
    {
        // Constant length part of the request is always 7 uint256 long.
        uint256 len = 7;

        len += Cairo.cairoStringSerializedLength(req.name);
        len += Cairo.cairoStringSerializedLength(req.symbol);
        len += Cairo.cairoStringSerializedLength(req.uri);

        // Arrays always have their length first, then serialized length of each element.
        // For uint256, we can pre-compute it as a uint256 is 2 felts long.
        len += (req.tokenIds.length * 2) + 1;
        len += (req.tokenValues.length * 2) + 1;
        len += (req.newOwners.length * 2) + 1;

        // For strings, we must iterate on the array to know the length of each string.
        // We start by adding the length of the tokenURIs array.
        len += 1;
        for (uint256 i = 0; i < req.tokenURIs.length; i++) {
            len += Cairo.cairoStringSerializedLength(req.tokenURIs[i]);
        }

        return len;
    }

    /**
       @notice Serializes a bridge request into an array of uint256
       that is compatible with serialization expected by Starknet messaging.

       @param req Request to serialize.

       @return uint256[] with the serialized request.
    */
    function requestSerialize(
        Request memory req
    )
        internal
        pure
        returns (uint256[] memory)
    {
        uint256[] memory buf = new uint256[](requestSerializedLength(req));

        // Constant length part of the request.
        buf[0] = felt252.unwrap(req.header);
        buf[1] = uint128(req.hash);
        buf[2] = uint128(req.hash >> 128);

        buf[3] = uint256(uint160(req.collectionL1));
        buf[4] = snaddress.unwrap(req.collectionL2);

        buf[5] = uint256(uint160(req.ownerL1));
        buf[6] = snaddress.unwrap(req.ownerL2);

        // Variable length part of the request.
        uint256 offset = 7;
        offset += Cairo.cairoStringSerialize(req.name, buf, offset);
        offset += Cairo.cairoStringSerialize(req.symbol, buf, offset);
        offset += Cairo.cairoStringSerialize(req.uri, buf, offset);

        offset += Cairo.uint256ArraySerialize(req.tokenIds, buf, offset);
        offset += Cairo.uint256ArraySerialize(req.tokenValues, buf, offset);
        offset += Cairo.cairoStringArraySerialize(req.tokenURIs, buf, offset);
        offset += Cairo.uint256ArraySerialize(req.newOwners, buf, offset);

        return buf;
    }

    /**
       @notice Deserializes a request from uint256[] from starknet messaging.

       @param buf Uint256[] buffer with the serialized request.
       @param offset Offset in the buffer where deserialization starts.

       @return Request.
    */
    function requestDeserialize(
        uint256[] memory buf,
        uint256 offset
    )
        internal
        pure
        returns (Request memory)
    {
        Request memory req;

        req.header = Cairo.felt252Wrap(buf[offset++]);
        req.hash = Cairo.uint256Deserialize(buf, offset);
        offset += 2;

        req.collectionL1 = address(uint160(buf[offset++]));
        req.collectionL2 = Cairo.snaddressWrap(buf[offset++]);

        req.ownerL1 = address(uint160(buf[offset++]));
        req.ownerL2 = Cairo.snaddressWrap(buf[offset++]);

        uint256 inc;

        (inc, req.name) = Cairo.cairoStringDeserialize(buf, offset);
        offset += inc;

        (inc, req.symbol) = Cairo.cairoStringDeserialize(buf, offset);
        offset += inc;

        (inc, req.uri) = Cairo.cairoStringDeserialize(buf, offset);
        offset += inc;

        (inc, req.tokenIds) = Cairo.uint256ArrayDeserialize(buf, offset);
        offset += inc;

        (inc, req.tokenValues) = Cairo.uint256ArrayDeserialize(buf, offset);
        offset += inc;

        (inc, req.tokenURIs) = Cairo.cairoStringArrayDeserialize(buf, offset);
        offset += inc;

        (inc, req.newOwners) = Cairo.uint256ArrayDeserialize(buf, offset);
        offset += inc;

        return req;
    }

}
