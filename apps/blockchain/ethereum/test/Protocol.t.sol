// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Protocol.sol";

/**
   @title Protocol testing.
*/
contract ProtocolTest is Test {

    //
    function setUp() public {
    }

    //
    function buildRequestDummy() public pure returns (Request memory) {
        uint256[] memory ids = new uint256[](1);
        ids[0] = 1;

        Request memory req = Request ({
            header: Cairo.felt252Wrap(0x1),
            hash: 0x1,
            collectionL1: address(0x0),
            collectionL2: Cairo.snaddressWrap(0x123),
            ownerL1: address(0x0),
            ownerL2: Cairo.snaddressWrap(0x789),
            name: "",
            symbol: "",
            uri: "ABCD",
            tokenIds: ids,
            tokenValues: new uint256[](0),
            tokenURIs: new string[](0),
            newOwners: new uint256[](0)
            });

        return req;
    }

    //
    function buildRequestDummyFull() public pure returns (Request memory) {
        uint256[] memory ids = new uint256[](1);
        ids[0] = 1;

        uint256[] memory values = new uint256[](1);
        values[0] = 2;

        string[] memory uris = new string[](1);
        uris[0] = "abcd";

        uint256[] memory newOwners = new uint256[](1);
        values[0] = 0x123;

        Request memory req = Request ({
            header: Cairo.felt252Wrap(0x1),
            hash: 0x1,
            collectionL1: address(0x0),
            collectionL2: Cairo.snaddressWrap(0x123),
            ownerL1: address(0x0),
            ownerL2: Cairo.snaddressWrap(0x789),
            name: "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefg",
            symbol: "SYMBOL",
            uri: "ABCD",
            tokenIds: ids,
            tokenValues: values,
            tokenURIs: uris,
            newOwners: newOwners
            });

        return req;
    }

    //
    function test_requestHeader() public {
        felt252 header = Protocol.requestHeaderV1(
            CollectionType.ERC721,
            false,
            false);
        assertEq(
            felt252.unwrap(header),
            0x0101
        );

        header = Protocol.requestHeaderV1(
            CollectionType.ERC1155,
            false,
            false);
        assertEq(
            felt252.unwrap(header),
            0x0201
        );

        header = Protocol.requestHeaderV1(
            CollectionType.ERC721,
            true,
            false);
        assertEq(
            felt252.unwrap(header),
            0x010101
        );

        header = Protocol.requestHeaderV1(
            CollectionType.ERC721,
            true,
            true);
        assertEq(
            felt252.unwrap(header),
            0x01010101
        );
        assertTrue(Protocol.canUseWithdrawAuto(felt252.unwrap(header)));
    }

    //
    function test_requestHash() public {
        uint256[] memory ids = new uint256[](1);
        ids[0] = 88;

        uint256 hash = Protocol.requestHash(
            123,
            0x0000000000000000000000000000000000000000,
            Cairo.snaddressWrap(0x1),
            ids
        );

        assertEq(
            hash,
            0xbb7ca67ee263bd2bb68dc88b530300222a3700bceca4e537079047fff89a0402
        );
    }

    //
    function test_requestSerializedLength() public {
        Request memory req = buildRequestDummy();
        uint256 len = Protocol.requestSerializedLength(req);
        assertEq(len, 22);

        Request memory reqFull = buildRequestDummyFull();
        uint256 lenFull = Protocol.requestSerializedLength(reqFull);
        assertEq(lenFull, 30);
    }

    //
    function test_requestSerialize() public {
        Request memory req = buildRequestDummy();

        uint256[] memory buf = Protocol.requestSerialize(req);
        assertEq(buf.length, Protocol.requestSerializedLength(req));
        assertEq(buf[0], 0x1);
        assertEq(buf[1], 0x1);
        assertEq(buf[2], 0x0);
        assertEq(buf[3], 0x0);
        assertEq(buf[4], 0x123);
        assertEq(buf[5], 0x0);
        assertEq(buf[6], 0x789);
        assertEq(buf[7], 0); // name data len
        assertEq(buf[8], 0); // name pending word
        assertEq(buf[9], 0); // name pending word len
        assertEq(buf[10], 0); // symbol data len
        assertEq(buf[11], 0); // symbol pending word
        assertEq(buf[12], 0); // symbol pending word len
        assertEq(buf[13], 0); // base_uri data len
        assertEq(buf[14], 0x0041424344); // base_uri pending word
        assertEq(buf[15], 4); // base_uri pending word len
        assertEq(buf[16], 1); // ids len
        assertEq(buf[17], 1); // ids[0] low
        assertEq(buf[18], 0); // ids[0] high
        assertEq(buf[19], 0); // values len
        assertEq(buf[20], 0); // uris len
        assertEq(buf[21], 0); // new owners len
    }

    //
    function test_requestDeserialize() public {
        uint256[] memory data = new uint256[](22);
        data[0] = 0x1; // header
        data[1] = 0x1; // hash low
        data[2] = 0x0; // hash high
        data[3] = 0x0; // collectionL1
        data[4] = 0x123; // collectionL2
        data[5] = 0x0; // ownerL1
        data[6] = 0x789; // ownerL2
        data[7] = 0; // name data len
        data[8] = 0; // name pending word
        data[9] = 0; // name pending word len
        data[10] = 0; // symbol data len
        data[11] = 0; // symbol pending word
        data[12] = 0; // symbol pending word len
        data[13] = 0; // base_uri data len
        data[14] = 0x0041424344; // base_uri pending word
        data[15] = 4; // base_uri pending word len
        data[16] = 1; // ids len
        data[17] = 1; // ids[0] low
        data[18] = 0; // ids[0] high
        data[19] = 0; // values len
        data[20] = 0; // uris len
        data[21] = 0; // new owners len

        Request memory req = Protocol.requestDeserialize(data, 0);

        assertEq(felt252.unwrap(req.header), 0x1);
        assertEq(req.hash, 0x1);
        assertEq(req.collectionL1, address(0x0));
        assertEq(snaddress.unwrap(req.collectionL2), 0x123);
        assertEq(req.ownerL1, address(0x0));
        assertEq(snaddress.unwrap(req.ownerL2), 0x789);
        assertEq(req.name, "");
        assertEq(req.symbol, "");
        assertEq(req.uri, "ABCD");
        assertEq(req.tokenIds.length, 1);
        assertEq(req.tokenIds[0], 1);
        assertEq(req.tokenValues.length, 0);
        assertEq(req.tokenURIs.length, 0);
        assertEq(req.newOwners.length, 0);
    }


}
