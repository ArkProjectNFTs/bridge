// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/CairoAdapter.sol";

contract CairoAdapterTest is Test {

    //
    function setUp() public {
    }

    //
    function testIsContractAddress() public {
        assertFalse(CairoAdapter.isContractAddress(0));
        assertFalse(CairoAdapter.isContractAddress(SN_MODULUS + 1));
        assertTrue(CairoAdapter.isContractAddress(0x12345));
    }

    //
    function testIsFelt252() public {
        assertFalse(CairoAdapter.isFelt252(SN_MODULUS + 1));
        assertTrue(CairoAdapter.isFelt252(0));
        assertTrue(CairoAdapter.isFelt252(0x12345));
    }

    //
    function testUint256IntoFelt252() public {
        uint256[] memory felts = CairoAdapter.uint256IntoFelt252(1);
        assertEq(felts.length, 2);
        assertEq(felts[0], 1);
        assertEq(felts[1], 0);
    }

    //
    function testUint256Serialize() public {
        uint256[] memory buf = new uint256[](2);
        uint256 offset = 0;

        offset += CairoAdapter.uint256Serialize(1, buf, offset);
        assertEq(offset, 2);
        assertEq(buf[0], 1);
        assertEq(buf[1], 0);
    }

    //
    function testShortStringSerializedLength() public {
        assertEq(CairoAdapter.shortStringSerializedLength(""), 1);
        assertEq(CairoAdapter.shortStringSerializedLength("ABCD"), 2);
        assertEq(
            CairoAdapter.shortStringSerializedLength(
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefg"),
            3);
    }

    //
    function testShortStringPack() public {
        uint256[] memory bufEmpty = CairoAdapter.shortStringPack("");
        assertEq(bufEmpty.length, 0);

        uint256[] memory buf = CairoAdapter.shortStringPack("ABCD");
        assertEq(buf.length, 1);
        assertEq(
            buf[0],
            0x0041424344000000000000000000000000000000000000000000000000000000);

        uint256[] memory buf2 = CairoAdapter.shortStringPack("ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefg");
        assertEq(buf2.length, 2);
        assertEq(
            buf2[0],
            0x004142434445464748494a4b4c4d4e4f505152535455565758595a3031323334);
        assertEq(
            buf2[1],
            0x0035363738393061626364656667000000000000000000000000000000000000);
    }

    //
    function testShortStringSerialize() public {
        uint256[] memory buf = new uint256[](2);
        uint256 offset = 0;

        offset += CairoAdapter.shortStringSerialize("ABCD", buf, offset);
        assertEq(offset, 2);
        assertEq(buf[0], 1);
        assertEq(
            buf[1],
            0x0041424344000000000000000000000000000000000000000000000000000000);
    }
}
