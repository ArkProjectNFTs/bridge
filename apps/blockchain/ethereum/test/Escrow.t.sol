// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC1155/IERC1155.sol";

import "forge-std/Test.sol";

import "../src/Escrow.sol";

import "./utils/Users.sol";
import "./token/ERC721MintFree.sol";
import "./token/IERC721MintRangeFree.sol";

/**
   @title Escrow testing.
*/
contract EscrowTest is Test {

    EscrowPublic escrow;
    address erc721;

    address payable internal alice;
    address payable internal bob;

    //
    function setUp() public {
        escrow = new EscrowPublic();
        erc721 = address(new ERC721MintFree("name 1", "S1"));

        Users genusers = new Users();
        address payable[] memory users = genusers.create(5);
        alice = users[0];
        bob = users[1];

        vm.prank(alice);
        IERC721(erc721).setApprovalForAll(address(escrow), true);
        vm.prank(bob);
        IERC721(erc721).setApprovalForAll(address(escrow), true);
    }

    //
    function test_deposit() public {
        IERC721MintRangeFree(erc721).mintRangeFree(alice, 0, 10);

        uint256[] memory ids = new uint256[](2);
        ids[0] = 5;
        ids[1] = 8;

        vm.prank(alice);
        escrow.depositIntoEscrow(CollectionType.ERC721, erc721, ids);

        uint256[] memory idsEscrowCheck = new uint256[](4);
        idsEscrowCheck[0] = 0;
        idsEscrowCheck[1] = 5;
        idsEscrowCheck[2] = 8;
        idsEscrowCheck[3] = 9;

        bool[] memory statuses = escrow.escrowStatuses(erc721, idsEscrowCheck);
        assertFalse(statuses[0]);
        assertTrue(statuses[1]);
        assertTrue(statuses[2]);
        assertFalse(statuses[3]);
    }

    //
    function testFail_depositNoIds() public {
        uint256[] memory ids = new uint256[](0);
        escrow.depositIntoEscrow(CollectionType.ERC721, erc721, ids);
    }

    //
    function test_withdraw() public {
        IERC721MintRangeFree(erc721).mintRangeFree(alice, 0, 10);

        uint256[] memory ids = new uint256[](2);
        ids[0] = 5;
        ids[1] = 8;

        vm.startPrank(alice);
        escrow.depositIntoEscrow(CollectionType.ERC721, erc721, ids);
        bool wasInEscrow = escrow.withdrawFromEscrow(CollectionType.ERC721, erc721, bob, 5);
        assertTrue(wasInEscrow);
        vm.stopPrank();

        uint256[] memory idsEscrowCheck = new uint256[](2);
        idsEscrowCheck[0] = 5;
        idsEscrowCheck[1] = 8;

        bool[] memory statuses = escrow.escrowStatuses(erc721, idsEscrowCheck);
        assertFalse(statuses[0]);
        assertTrue(statuses[1]);

        assertEq(IERC721(erc721).ownerOf(5), bob);
    }
}

/**
   @title Escrow interface exposed for test.
 */
contract EscrowPublic is StarklaneEscrow {

    /**
       @notice test _depositIntoEscrow.
    */
    function depositIntoEscrow(
        CollectionType collectionType,
        address collection,
        uint256[] memory ids
    )
        public
    {
        _depositIntoEscrow(collectionType, collection, ids);
    }

    /**
       @notice test _withdrawFromEscrow.
    */
    function withdrawFromEscrow(
        CollectionType collectionType,
        address collection,
        address to,
        uint256 id
    )
        public
        returns (bool)
    {
        return _withdrawFromEscrow(collectionType, collection, to, id);
    }
}
