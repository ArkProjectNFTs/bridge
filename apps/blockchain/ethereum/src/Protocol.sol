// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./Cairo.sol";


/*
 * Request to bridge tokens.
 *
 * Ethereum addresses always fit into a single felt252.
 */
struct Request {
    felt252 header;
    felt252 reqHash;

    address contractL1Address;
    snaddress contractL2Address;

    address ownerL1Address;
    snaddress ownerL2Address;

    string name;
    string symbol;
    string uri;

    uint256[] tokenIds;
    uint256[] tokenValues;
    string[] tokenUris;
}

/*
 * Library related to the protocol for bridging tokens.
 */
library Protocol {

    /*
     * Computes the serialized length of a request.
     */
    function requestSerializedLength(Request memory req)
        internal
        pure
        returns (uint256) {
        // Constant length part of the request is always 6 uint256 long.
        uint256 len = 6;

        len += Cairo.shortStringSerializedLength(req.name);
        len += Cairo.shortStringSerializedLength(req.symbol);
        len += Cairo.shortStringSerializedLength(req.uri);

        // Arrays always have their length first, then serialized length of each element.
        // For uint256, we can pre-compute it as a uint256 is 2 felts long.
        len += (req.tokenIds.length * 2) + 1;
        len += (req.tokenValues.length * 2) + 1;

        // For strings, we must iterate on the array to know the length of each string.
        // We start by adding the length of the tokenUris array.
        len += 1;
        for (uint256 i = 0; i < req.tokenUris.length; i++) {
            len += Cairo.shortStringSerializedLength(req.tokenUris[i]);
        }

        return len;
    }

    /*
     * Serializes a bridge request into an array of uint256
     * that is compatible with serialization expected by Starknet messaging.
     *
     * TODO: add link to the protocol design.
     */
    function requestSerialize(Request memory req)
        internal
        pure
        returns (uint256[] memory) {

        uint256[] memory buf = new uint256[](requestSerializedLength(req));

        // Constant length part of the request.
        buf[0] = felt252.unwrap(req.header);
        buf[1] = felt252.unwrap(req.reqHash);

        buf[2] = uint256(uint160(req.contractL1Address));
        buf[3] = snaddress.unwrap(req.contractL2Address);

        buf[4] = uint256(uint160(req.ownerL1Address));
        buf[5] = snaddress.unwrap(req.ownerL2Address);

        // Variable length part of the request.
        uint256 offset = 6;
        offset += Cairo.shortStringSerialize(req.name, buf, offset);
        offset += Cairo.shortStringSerialize(req.symbol, buf, offset);
        offset += Cairo.shortStringSerialize(req.uri, buf, offset);

        offset += Cairo.uint256ArraySerialize(req.tokenIds, buf, offset);
        offset += Cairo.uint256ArraySerialize(req.tokenValues, buf, offset);
        offset += Cairo.shortStringArraySerialize(req.tokenUris, buf, offset);

        return buf;
    }

    /*
     *
     */
    function requestDeserialize(uint256[] calldata buf)
        internal
        pure
        returns (Request memory) {

        Request memory req;

        req.header = Cairo.felt252Wrap(buf[0]);
        req.reqHash = Cairo.felt252Wrap(buf[1]);

        req.contractL1Address = address(uint160(buf[2]));
        req.contractL2Address = Cairo.snaddressWrap(buf[3]);

        req.ownerL1Address = address(uint160(buf[4]));
        req.ownerL2Address = Cairo.snaddressWrap(buf[5]);

        uint256 offset = 6;

        (uint256 inc1, string memory name) = Cairo.shortStringDeserialize(buf, offset);
        offset += inc1;
        req.name = name;

        (uint256 inc2, string memory symbol) = Cairo.shortStringDeserialize(buf, offset);
        offset += inc2;
        req.symbol = symbol;

        (uint256 inc3, string memory uri) = Cairo.shortStringDeserialize(buf, offset);
        offset += inc3;
        req.uri = uri;

        (uint256 inc4, uint256[] memory ids) = Cairo.uint256ArrayDeserialize(buf, offset);
        offset += inc4;
        req.tokenIds = ids;

        (uint256 inc5, uint256[] memory amounts) = Cairo.uint256ArrayDeserialize(buf, offset);
        offset += inc5;
        req.tokenValues = amounts;

        (uint256 inc6, string[] memory uris) = Cairo.shortStringArrayDeserialize(buf, offset);
        offset += inc6;
        req.tokenUris = uris;

        return req;
    }

}
