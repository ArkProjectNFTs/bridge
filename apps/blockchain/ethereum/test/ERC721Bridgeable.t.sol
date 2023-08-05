// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ERC721Bridgeable.sol";

contract ERC721BridgeableTest is Test {
    ERC721Bridgeable public erc721b;
    address constant public BRIDGE = 0xE0f5206BBD039e7b0592d8918820024e2a7437b9;
    address constant public NEW_OWNER = 0xC00d9BE3fff28C442a3a780045b22eA9603a2a84;

    //
    function setUp() public {
    }

    //
    function testPermissionMint() public {
        /* uint256 tokenId = 77; */
        /* string memory tokenURI = "https://..."; */

        /* vm.prank(address(BRIDGE)); */
        /* erc721b.permissionedMint(NEW_OWNER, tokenId, tokenURI); */
        /* assertEq(erc721b.ownerOf(tokenId), NEW_OWNER); */
    }

}
