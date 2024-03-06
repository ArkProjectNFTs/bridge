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

        vm.expectRevert();
        Cairo.felt252Wrap(type(uint256).max);
    }

    //
    function test_snaddressWrap() public  {
        snaddress a = Cairo.snaddressWrap(1);
        uint256 v = 1;
        assertTrue(snaddress.unwrap(a) == v);

        vm.expectRevert();
        Cairo.snaddressWrap(type(uint256).max);
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
    function test_cairoStringSerializedLength() public {
        assertEq(Cairo.cairoStringSerializedLength(""), 3);
        assertEq(Cairo.cairoStringSerializedLength("ABCD"), 3);
        assertEq(
            Cairo.cairoStringSerializedLength(
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefg"),
            4);
    }

    //
    function test_cairoStringPack() public {
        uint256[] memory bufEmpty = Cairo.cairoStringPack("");
        assertEq(bufEmpty[0], 0);
        assertEq(bufEmpty[1], 0);
        assertEq(bufEmpty[2], 0);
        assertEq(bufEmpty.length, 3);
        uint256[] memory bufShort = Cairo.cairoStringPack("ABC");
        assertEq(bufShort[0], 0);
        assertEq(bufShort[1], 0x414243);
        assertEq(bufShort[2], 3);
        assertEq(bufShort.length, 3);

        uint256[] memory bufLong = Cairo.cairoStringPack("ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefg");
        assertEq(bufLong[0], 1);
        assertEq(bufLong[1], 0x004142434445464748494a4b4c4d4e4f505152535455565758595a3031323334);
        assertEq(bufLong[2], 0x0035363738393061626364656667);
        assertEq(bufLong[3], 13);
        assertEq(bufLong.length, 4);

    }

    //
    function test_cairoStringUnpack() public {
        uint256[] memory buf = new uint256[](3);
        buf[0] = 0;
        buf[1] = 0x00414243;
        buf[2] = 3;
        string memory a = Cairo.cairoStringUnpack(buf, 0);
        assertEq(a, "ABC");

        uint256[] memory buf2 = new uint256[](4);
        buf2[0] = 1;
        buf2[1] = 0x00546869732070616c696e64726f6d65206973206e6f7420617320676f6f642c;
        buf2[2] = 0x0020627574206174206c656173742069742773206c6f6e6720656e6f756768;
        buf2[3] = 30;
        string memory b = Cairo.cairoStringUnpack(buf2, 0);
        assertEq(b, "This palindrome is not as good, but at least it's long enough");
    }

    //
    function test_cairoStringSerialize() public {
        uint256[] memory buf = new uint256[](3);
        uint256 offset = 0;

        offset += Cairo.cairoStringSerialize("ABCD", buf, offset);
        assertEq(offset, 3);
        assertEq(buf[0], 0);
        assertEq(
            buf[1],
            0x0041424344);
        assertEq(buf[2], 4);
    }

    //
    function test_cairoStringDeserialize() public {
        uint256[] memory buf = new uint256[](4);
        buf[0] = 1;
        buf[1] = 0x004142434445464748494a4b4c4d4e4f505152535455565758595a3031323334;
        buf[2] = 0x0035363738393061626364656667;
        buf[3] = 13;

        (uint256 inc, string memory s) = Cairo.cairoStringDeserialize(buf, 0);
        assertEq(inc, 4);
        assertTrue(Strings.equal(s, "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefg"));
    }

    //
    function test_cairoStringArraySerialize() public {
        string[] memory data = new string[](2);
        data[0] = "ABCD";
        data[1] = "abcd";

        uint256[] memory buf = new uint256[](7);

        uint256 inc = Cairo.cairoStringArraySerialize(data, buf, 0);
        assertEq(inc, 7);
        assertEq(buf[0], 2);
        assertEq(buf[1], 0);
        assertEq(buf[2], 0x0041424344);
        assertEq(buf[3], 4);
        assertEq(buf[4], 0);
        assertEq(buf[5], 0x0061626364);
        assertEq(buf[6], 4);
    }

    //
    function test_cairoStringArrayDeserialize() public {
        uint256[] memory buf = new uint256[](7);
        buf[0] = 2;
        buf[1] = 0;
        buf[2] = 0x0041424344;
        buf[3] = 4;
        buf[4] = 0;
        buf[5] = 0x0061626364;
        buf[6] = 4;

        (uint256 inc, string[] memory strs) = Cairo.cairoStringArrayDeserialize(buf, 0);
        assertEq(inc, 7);
        assertEq(strs[0], "ABCD");
        assertEq(strs[1], "abcd");
    }

    //
    function test_cairoStringArrayDeserializeEmpty() public {
        uint256[] memory buf = new uint256[](1);
        buf[0] = 0;

        (uint256 inc, string[] memory strs) = Cairo.cairoStringArrayDeserialize(buf, 0);
        assertEq(inc, 1);
        assertEq(strs.length, 0);
    }

}

