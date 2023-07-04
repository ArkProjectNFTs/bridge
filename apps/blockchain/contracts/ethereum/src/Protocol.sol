// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./CairoAdapter.sol";

/*
 * Request to bridge tokens.
 *
 * The request is a structure known also by Starknet.
 * Serialization must match the Span<felt252> representation
 * to ensure deserialization.
 *
 * When Starknet is serializing this struct, as a felt252
 * fits into a uint256, the interoperability is ensured.
 *
 * To avoid unecesary gas cost, one should rely on comment
 * to know the Starknet underlying type (felt252 or not).
 * Because wrapper uint256 into a Felt252 struct would cost
 * more gas for the struct initialization and allocation.
 */
struct BridgeRequest {
    // (felt252)
    uint256 header;
    // (felt252)
    uint256 reqHash;
    // Collection info.
    address collectionL1Address;
    // (felt252)
    uint256 collectionL2Address;
    string collectionName;
    string collectionSymbol;
    // (felt252)
    uint256 collectionContractType;
    // Owner information.
    address ownerL1Address;
    // (felt252)
    uint256 ownerL2Address;
    // List of tokens to be bridged for this collection.
    TokenInfo[] tokens;
}

/*
 * Token information.
 */
struct TokenInfo {
    uint256 tokenId;
    string tokenURI;
}

/*
 * Library related to the protocol for bridging tokens.
 */
library Protocol {

    /*
     * Serializes a bridge request into an array of uint256
     * that is compatible with serialization expected by Starknet.
     *
     * TODO: add link to the protocol design.
     */
    function bridgeRequestSerialize(BridgeRequest memory req)
        internal
        pure
        returns (uint256[] memory) {

        // TODO: add the first byte as the length of the Span<felt252>...!

        // 7 fixed fields (uint256 + address).
        uint256 len = 7;

        // TODO: support variable length string.
        // For now, name and symbol are felts, so only one uint256 each.
        len += CairoAdapter.shortStringSerializedLength(req.collectionName);
        len += CairoAdapter.shortStringSerializedLength(req.collectionSymbol);
        //len += 2;

        // Variable length tokens.
        for (uint256 i = 0; i < req.tokens.length; i++) {
            // +2 A token ID is a uint256 in Starknet struct -> 2 felts.
            len += 2;
            len += CairoAdapter.shortStringSerializedLength(req.tokens[i].tokenURI);
        }

        // Add one for the encoded length of the token list.
        len++;
        uint256[] memory buf = new uint256[](len + 1);
        buf[0] = len;

        // TODO: add a method to compute the length of the serialized form
        // of the struct...!

        buf[1] = req.header;
        buf[2] = req.reqHash;
        buf[3] = uint256(uint160(req.collectionL1Address));
        buf[4] = req.collectionL2Address;

        uint256 idx = 5;
        idx += CairoAdapter.shortStringSerialize(req.collectionName, buf, idx);
        idx += CairoAdapter.shortStringSerialize(req.collectionSymbol, buf, idx);

        buf[idx++] = req.collectionContractType;
        buf[idx++] = uint256(uint160(req.ownerL1Address));
        buf[idx++] = req.ownerL2Address;

        buf[idx++] = req.tokens.length;

        //uint256 idx = 11;
        for (uint256 i = 0; i < req.tokens.length; i++) {
            TokenInfo memory info = req.tokens[i];
            // TODO: we may also add a tokenInfoSerialize to be cleaner.

            idx += CairoAdapter.uint256Serialize(info.tokenId, buf, idx);
            idx += CairoAdapter.shortStringSerialize(info.tokenURI, buf, idx);
        }

        return buf;
    }

    event Deserializer(uint256 indexed a, uint256 indexed b, uint256 indexed c);

    /*
     *
     */
    function bridgeRequestDeserialize(uint256[] calldata buf)
        internal
        returns (BridgeRequest memory) {

        BridgeRequest memory req;
        
        uint256 idx = 0;

        emit Deserializer(1, buf.length, idx);
        req.header = buf[idx++];
        req.reqHash = buf[idx++];
        req.collectionL1Address = address(uint160(buf[idx++]));
        req.collectionL2Address = buf[idx++];
        emit Deserializer(2, 0, idx);

        // Get length of name and symbol before unpack.
        uint256 nameLen = buf[idx++];
        req.collectionName = CairoAdapter.shortStringUnpack(buf, idx, nameLen);
        idx += nameLen;
        emit Deserializer(3, 0, idx);

        uint256 symbolLen = buf[idx++];
        req.collectionSymbol = CairoAdapter.shortStringUnpack(buf, idx, symbolLen);
        idx += symbolLen;
        emit Deserializer(4, 0, idx);

        req.collectionContractType = buf[idx++];
        req.ownerL1Address = address(uint160(buf[idx++]));
        req.ownerL2Address = buf[idx++];
        emit Deserializer(5, 0, idx);

        uint256 nTokens = buf[idx++];
        emit Deserializer(6, 0, idx);
        req.tokens = new TokenInfo[](nTokens);

        for (uint256 i = 0; i < nTokens; i++) {
            TokenInfo memory info;
            // token id is u256 in cairo -> 2 felts.
            info.tokenId = CairoAdapter.uint256FromCairo(buf, idx);
            idx += 2;
            uint256 lenURI = buf[idx++];
            info.tokenURI = CairoAdapter.shortStringUnpack(buf, idx, lenURI);
            idx += lenURI;

            req.tokens[i] = info;
        }

        return req;
    }

}
