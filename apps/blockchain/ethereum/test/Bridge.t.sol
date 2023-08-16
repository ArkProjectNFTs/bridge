// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC1155/IERC1155.sol";

import "forge-std/Test.sol";
import "../src/IStarklane.sol";
import "../src/Bridge.sol";
import "../src/sn/Cairo.sol";
import "../src/sn/StarknetMessagingLocal.sol";
import "../src/sn/IStarknetMessagingLocal.sol";
import "../src/token/Deployer.sol";
import "../src/token/TokenUtil.sol";

import "./utils/Users.sol";
import "./token/ERC721MintFree.sol";
import "./token/IERC721MintRangeFree.sol";

/**
   @title Bridge testing.
*/
contract BridgeTest is Test {

    address bridge;
    address erc721C1;
    address erc1155C1;
    address snCore;

    address payable internal alice;
    address payable internal bob;

    //
    function setUp() public {
        Users genusers = new Users();
        address payable[] memory users = genusers.create(5);
        alice = users[0];
        bob = users[1];

        // "Regular" collections, not controlled by the bridge.
        erc721C1 = address(new ERC721MintFree("name 1", "S1"));

        snCore = address(new StarknetMessagingLocal());

        address impl = address(new Starklane());
        
        bytes memory dataInit = abi.encodeWithSelector(
            Starklane.initialize.selector,
            abi.encode(
                address(this),
                snCore,
                0x1,
                0x2
            )
        );

        bridge = address(new ERC1967Proxy(impl, dataInit));
    }

    //
    function testFail_invalidIds() public {
        uint256[] memory ids = new uint256[](0);

        uint256 salt = 0x1;
        snaddress to = Cairo.snaddressWrap(0x1);

        IStarklane(bridge).depositTokens{value: 30000}(
            salt,
            address(erc721C1),
            to,
            ids,
            false
        );
    }

    //
    function testFail_invalidSalt() public {
        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 9;

        uint256 salt = 0x1;
        snaddress to = Cairo.snaddressWrap(0x0);

        IStarklane(bridge).depositTokens{value: 30000}(
            salt,
            address(erc721C1),
            to,
            ids,
            false
        );
    }

    //
    function testFail_invalidL2Owner() public {
        uint256[] memory ids = new uint256[](0);

        uint256 salt = 0x0;
        snaddress to = Cairo.snaddressWrap(0x0);

        IStarklane(bridge).depositTokens{value: 30000}(
            salt,
            address(erc721C1),
            to,
            ids,
            false
        );
    }

    //
    function test_depositTokenERC721() public {
        IERC721MintRangeFree(erc721C1).mintRangeFree(alice, 0, 10);

        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 9;

        uint256 salt = 0x1;
        snaddress to = Cairo.snaddressWrap(0x1);

        vm.startPrank(alice);
        IERC721(erc721C1).setApprovalForAll(address(bridge), true);
        IStarklane(bridge).depositTokens{value: 30000}(
            salt,
            address(erc721C1),
            to,
            ids,
            false
        );
        vm.stopPrank();

        // TODO: test event emission to verify the request.
    }

    // Test a withdraw auto that will trigger the deploy of a new collection on L1.
    function test_withdrawTokensERC721AutoWithdrawDeploy() public {
        // Build the request and compute it's "would be" message hash.
        felt252 header = Protocol.requestHeaderV1(CollectionType.ERC721, false, true);
        Request memory req = buildRequestDeploy(header, 888, bob);
        uint256[] memory reqSerialized = Protocol.requestSerialize(req);
        bytes32 msgHash = computeMessageHashFromL2(reqSerialized);

        // The message must be simulated to come from the L2 indexer and registered
        // as QUICK message.

        IStarklane(bridge).addMessageHashForAutoWithdraw(uint256(msgHash));
        address collection = IStarklane(bridge).withdrawTokens(reqSerialized);

        // TODO: add verification of event emission.

        assertEq(IERC721(collection).ownerOf(888), bob);

        vm.expectRevert();
        IStarklane(bridge).withdrawTokens(reqSerialized);
    }

    // Test a withdraw STARKNET that will trigger the deploy of a new collection on L1.
    function test_withdrawTokensERC721StarknetWithdrawDeploy() public {
        // Build the request and compute it's "would be" message hash.
        felt252 header = Protocol.requestHeaderV1(CollectionType.ERC721, false, false);
        Request memory req = buildRequestDeploy(header, 888, bob);
        uint256[] memory reqSerialized = Protocol.requestSerialize(req);
        bytes32 msgHash = computeMessageHashFromL2(reqSerialized);

        // The message must be simulated to come from starknet verifier contract
        // on L1 and pushed to starknet core.
        IStarknetMessagingLocal(snCore).addMessageHashFromL2(uint256(msgHash));
        address collection = IStarklane(bridge).withdrawTokens(reqSerialized);

        // TODO: add verification of event emission.

        assertEq(IERC721(collection).ownerOf(888), bob);

        // Error message from Starknet Core expected.
        vm.expectRevert(bytes("INVALID_MESSAGE_TO_CONSUME"));
        IStarklane(bridge).withdrawTokens(reqSerialized);
    }

    // Build a request that should trigger a deploy of a new collection on L1.
    function buildRequestDeploy(
        felt252 header,
        uint256 id,
        address newOwner
    )
        public
        pure
        returns (Request memory)
    {
        uint256[] memory ids = new uint256[](1);
        ids[0] = id;

        Request memory req = Request ({
            header: header,
            hash: 0x1,
            collectionL1: address(0x0),
            collectionL2: Cairo.snaddressWrap(0x123),
            ownerL1: newOwner,
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
    function computeMessageHashFromL2(
        uint256[] memory request
    )
        public
        returns (bytes32)
    {
        (snaddress starklaneL2Address, felt252 starklaneL2Selector)
            = IStarklane(bridge).l2Info();

        // To remove warning. Is there a better way?
        assertTrue(felt252.unwrap(starklaneL2Selector) > 0);

        bytes32 msgHash = keccak256(
            abi.encodePacked(
                snaddress.unwrap(starklaneL2Address),
                uint256(uint160(bridge)),
                request.length,
                request)
        );

        return msgHash;
    }

}
