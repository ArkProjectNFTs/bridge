// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/sn/Cairo.sol";

/**
   @title Cairo testing.
*/
contract CairoTest is Test {

    //
    function setUp() public {
    }

    //
    function test_isContractAddress() public {
        assertFalse(Cairo.isContractAddress(0));
        assertFalse(Cairo.isContractAddress(SN_MODULUS + 1));
        assertTrue(Cairo.isContractAddress(0x12345));
    }

    //
    function test_isFelt252() public {
        assertFalse(Cairo.isFelt252(SN_MODULUS + 1));
        assertTrue(Cairo.isFelt252(0));
        assertTrue(Cairo.isFelt252(0x12345));
    }

    //
    function test_felt252Wrap() public  {
        felt252 f = Cairo.felt252Wrap(1);
        uint256 v = 1;
        assertTrue(felt252.unwrap(f) == v);

        vm.expectRevert(bytes("Error wrapping uint256 into felt252."));
        Cairo.felt252Wrap(type(uint256).max);
    }

    //
    function test_snaddressWrap() public  {
        snaddress a = Cairo.snaddressWrap(1);
        uint256 v = 1;
        assertTrue(snaddress.unwrap(a) == v);

        vm.expectRevert(bytes("Error wrapping uint256 into snaddress."));
        Cairo.snaddressWrap(type(uint256).max);

        vm.expectRevert(bytes("Error wrapping uint256 into snaddress."));
        Cairo.snaddressWrap(0);
    }

    //
    function test_uint256Serialize() public {
        uint256[] memory buf = new uint256[](2);
        uint256 offset = 0;

        offset += Cairo.uint256Serialize(1, buf, offset);
        assertEq(offset, 2);
        assertEq(buf[0], 1);
        assertEq(buf[1], 0);
    }

    //
    function test_uint256Deserialize() public {
        uint256[] memory buf = new uint256[](2);
        buf[0] = 9;
        buf[1] = 0;

        uint256 v = Cairo.uint256Deserialize(buf, 0);
        assertEq(v, 9);
    }

    //
    function test_uint256ArraySerializeEmpty() public {
        uint256[] memory data = new uint256[](0);

        uint256[] memory buf = new uint256[](1);
        uint256 offset = 0;

        uint256 inc = Cairo.uint256ArraySerialize(data, buf, offset);
        assertEq(inc, 1);
        assertEq(buf[0], 0);
    }

    //
    function test_uint256ArraySerialize() public {
        uint256[] memory data = new uint256[](2);
        data[0] = 1;
        data[1] = 2;

        uint256[] memory buf = new uint256[](5);
        uint256 offset = 0;

        uint256 inc = Cairo.uint256ArraySerialize(data, buf, offset);
        assertEq(inc, 5);
        assertEq(buf[0], 2);
        assertEq(buf[1], 1);
        assertEq(buf[2], 0);
        assertEq(buf[3], 2);
        assertEq(buf[4], 0);
    }

    //
    function test_uint256ArrayDeserialize() public {
        // Cairo serialized array with 2 uint256.
        uint256[] memory buf = new uint256[](5);
        buf[0] = 2;
        buf[1] = 1;
        buf[2] = 0;
        buf[3] = 2;
        buf[4] = 0;

        (uint256 inc, uint256[] memory data) = Cairo.uint256ArrayDeserialize(buf, 0);
        assertEq(inc, 5);
        assertEq(data.length, 2);
        assertEq(data[0], 1);
        assertEq(data[1], 2);
    }

    //
    function test_shortStringSerializedLength() public {
        assertEq(Cairo.shortStringSerializedLength(""), 1);
        assertEq(Cairo.shortStringSerializedLength("ABCD"), 2);
        assertEq(
            Cairo.shortStringSerializedLength(
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefg"),
            3);
    }

    //
    function test_shortStringPack() public {
        uint256[] memory bufEmpty = Cairo.shortStringPack("");
        assertEq(bufEmpty.length, 0);

        uint256[] memory buf = Cairo.shortStringPack("ABCD");
        assertEq(buf.length, 1);
        assertEq(
            buf[0],
            0x0041424344000000000000000000000000000000000000000000000000000000);

        uint256[] memory buf2 = Cairo.shortStringPack("ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefg");
        assertEq(buf2.length, 2);
        assertEq(
            buf2[0],
            0x004142434445464748494a4b4c4d4e4f505152535455565758595a3031323334);
        assertEq(
            buf2[1],
            0x0035363738393061626364656667000000000000000000000000000000000000);
    }

    //
    function test_shortStringUnpack() public {
        uint256 v1 = 0x00414243000000000000000000000000000000000000000000000000000000;
        string memory a = Cairo.uint256AsciiToString(v1);
        assertEq(a, "ABC");
        assertTrue(Strings.equal(a, "ABC"));

        uint256[] memory buf = new uint256[](1);
        buf[0] = 0x00414243000000000000000000000000000000000000000000000000000000;
        string memory s = Cairo.shortStringUnpack(buf, 0, buf.length);
        assertEq(s, "ABC");

        uint256[] memory buf2 = new uint256[](2);
        buf2[0] = 0x004142434445464748494a4b4c4d4e4f505152535455565758595a3031323334;
        buf2[1] = 0x0035363738393061626364656667000000000000000000000000000000000000;
        string memory s2 = Cairo.shortStringUnpack(buf2, 0, buf2.length);
        assertTrue(Strings.equal(s2, "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefg"));
    }

    //
    function test_shortStringSerialize() public {
        uint256[] memory buf = new uint256[](2);
        uint256 offset = 0;

        offset += Cairo.shortStringSerialize("ABCD", buf, offset);
        assertEq(offset, 2);
        assertEq(buf[0], 1);
        assertEq(
            buf[1],
            0x0041424344000000000000000000000000000000000000000000000000000000);
    }

    //
    function test_shortStringDeserialize() public {
        uint256[] memory buf = new uint256[](3);
        buf[0] = 2;
        buf[1] = 0x004142434445464748494a4b4c4d4e4f505152535455565758595a3031323334;
        buf[2] = 0x0035363738393061626364656667000000000000000000000000000000000000;

        (uint256 inc, string memory s) = Cairo.shortStringDeserialize(buf, 0);
        assertEq(inc, 3);
        assertTrue(Strings.equal(s, "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefg"));
    }

    //
    function test_shortStringArraySerialize() public {
        string[] memory data = new string[](2);
        data[0] = "ABCD";
        data[1] = "abcd";

        uint256[] memory buf = new uint256[](5);

        uint256 inc = Cairo.shortStringArraySerialize(data, buf, 0);
        assertEq(inc, 5);
        assertEq(buf[0], 2);
        assertEq(buf[1], 1);
        assertEq(buf[2], 0x0041424344000000000000000000000000000000000000000000000000000000);
        assertEq(buf[3], 1);
        assertEq(buf[4], 0x0061626364000000000000000000000000000000000000000000000000000000);
    }

    //
    function test_shortStringArrayDeserialize() public {
        uint256[] memory buf = new uint256[](5);
        buf[0] = 2;
        buf[1] = 1;
        buf[2] = 0x0041424344000000000000000000000000000000000000000000000000000000;
        buf[3] = 1;
        buf[4] = 0x0061626364000000000000000000000000000000000000000000000000000000;

        (uint256 inc, string[] memory strs) = Cairo.shortStringArrayDeserialize(buf, 0);
        assertEq(inc, 5);
        assertEq(strs[0], "ABCD");
        assertEq(strs[1], "abcd");
    }

    //
    function test_shortStringArrayDeserializeEmpty() public {
        uint256[] memory buf = new uint256[](1);
        buf[0] = 0;

        (uint256 inc, string[] memory strs) = Cairo.shortStringArrayDeserialize(buf, 0);
        assertEq(inc, 1);
        assertEq(strs.length, 0);
    }

}
