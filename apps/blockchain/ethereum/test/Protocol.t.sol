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
            hash: Cairo.felt252Wrap(0x1),
            contractL1Address: address(0x0),
            contractL2Address: Cairo.snaddressWrap(0x123),
            ownerL1Address: address(0x0),
            ownerL2Address: Cairo.snaddressWrap(0x789),
            name: "",
            symbol: "",
            uri: "ABCD",
            tokenIds: ids,
            tokenValues: new uint256[](0),
            tokenURIs: new string[](0)
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

        Request memory req = Request ({
            header: Cairo.felt252Wrap(0x1),
            hash: Cairo.felt252Wrap(0x1),
            contractL1Address: address(0x0),
            contractL2Address: Cairo.snaddressWrap(0x123),
            ownerL1Address: address(0x0),
            ownerL2Address: Cairo.snaddressWrap(0x789),
            name: "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefg",
            symbol: "SYMBOL",
            uri: "ABCD",
            tokenIds: ids,
            tokenValues: values,
            tokenURIs: uris
            });

        return req;
    }

    //
    function test_requestHash() public {
        uint256[] memory ids = new uint256[](1);
        ids[0] = 88;

        felt252 hash = Protocol.requestHash(
            123,
            0x0000000000000000000000000000000000000000,
            Cairo.felt252Wrap(0x1),
            ids
        );

        assertEq(
            felt252.unwrap(hash),
            0x0084aebe52e7140a6922182249b906caf91e5ec86fc5b380a39e54edfa85c118
        );
    }

    //
    function test_requestSerializedLength() public {
        Request memory req = buildRequestDummy();
        uint256 len = Protocol.requestSerializedLength(req);
        assertEq(len, 15);

        Request memory reqFull = buildRequestDummyFull();
        uint256 lenFull = Protocol.requestSerializedLength(reqFull);
        assertEq(lenFull, 22);
    }

    //
    function test_requestSerialize() public {
        Request memory req = buildRequestDummy();

        uint256[] memory buf = Protocol.requestSerialize(req);
        assertEq(buf.length, Protocol.requestSerializedLength(req));
        assertEq(buf[0], 0x1);
        assertEq(buf[1], 0x1);
        assertEq(buf[2], 0x0);
        assertEq(buf[3], 0x123);
        assertEq(buf[4], 0x0);
        assertEq(buf[5], 0x789);
        assertEq(buf[6], 0);
        assertEq(buf[7], 0);
        assertEq(buf[8], 1);
        assertEq(buf[9], 0x0041424344000000000000000000000000000000000000000000000000000000);
        assertEq(buf[10], 1);
        assertEq(buf[11], 1);
        assertEq(buf[12], 0);
        assertEq(buf[13], 0);
        assertEq(buf[14], 0);
    }

    //
    function test_requestDeserialize() public {
        uint256[] memory data = new uint256[](15);
        data[0] = 0x1;
        data[1] = 0x1;
        data[2] = 0x0;
        data[3] = 0x123;
        data[4] = 0x0;
        data[5] = 0x789;
        data[6] = 0;
        data[7] = 0;
        data[8] = 1;
        data[9] = 0x0041424344000000000000000000000000000000000000000000000000000000;
        data[10] = 1;
        data[11] = 1;
        data[12] = 0;
        data[13] = 0;
        data[14] = 0;

        Request memory req = Protocol.requestDeserialize(data, 0);

        assertEq(felt252.unwrap(req.header), 0x1);
        assertEq(felt252.unwrap(req.hash), 0x1);
        assertEq(req.contractL1Address, address(0x0));
        assertEq(snaddress.unwrap(req.contractL2Address), 0x123);
        assertEq(req.ownerL1Address, address(0x0));
        assertEq(snaddress.unwrap(req.ownerL2Address), 0x789);
        assertEq(req.name, "");
        assertEq(req.symbol, "");
        assertEq(req.uri, "ABCD");
        assertEq(req.tokenIds.length, 1);
        assertEq(req.tokenIds[0], 1);
        assertEq(req.tokenValues.length, 0);
        assertEq(req.tokenURIs.length, 0);
    }


}
