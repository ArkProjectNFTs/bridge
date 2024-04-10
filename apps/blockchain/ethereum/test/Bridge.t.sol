// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC1155/IERC1155.sol";

import "forge-std/Test.sol";
import "../src/IStarklane.sol";
import "../src/IStarklaneEvent.sol";

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
contract BridgeTest is Test, IStarklaneEvent {

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
        IStarklane(bridge).enableBridge(true);
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

    function test_L2OwnerOverflow() public {
        uint256[] memory ids = new uint256[](0);

        uint256 salt = 0x0;
        snaddress to = snaddress.wrap(SN_MODULUS);

        vm.expectRevert(CairoWrapError.selector);
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

    function test_depositTokenERC721_notEnabled() public {
        IStarklane(bridge).enableBridge(false);

        IERC721MintRangeFree(erc721C1).mintRangeFree(alice, 0, 10);

        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 9;

        uint256 salt = 0x1;
        snaddress to = Cairo.snaddressWrap(0x1);

        vm.startPrank(alice);
        IERC721(erc721C1).setApprovalForAll(address(bridge), true);
        vm.expectRevert(BridgeNotEnabledError.selector);
        IStarklane(bridge).depositTokens{value: 30000}(
            salt,
            address(erc721C1),
            to,
            ids,
            false
        );
        vm.stopPrank();
    }

    function test_depositTokenERC721_notWhiteListed() public {
        IERC721MintRangeFree(erc721C1).mintRangeFree(alice, 0, 10);

        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 9;

        uint256 salt = 0x1;
        snaddress to = Cairo.snaddressWrap(0x1);

        IStarklane(bridge).enableWhiteList(true);

        vm.startPrank(alice);
        IERC721(erc721C1).setApprovalForAll(address(bridge), true);
        
        vm.expectRevert(NotWhiteListedError.selector);
        IStarklane(bridge).depositTokens{value: 30000}(
            salt,
            address(erc721C1),
            to,
            ids,
            false
        );
        vm.stopPrank();
    }

    function test_depositTokenERC721_whiteListed() public {
        IERC721MintRangeFree(erc721C1).mintRangeFree(alice, 0, 10);

        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 9;

        uint256 salt = 0x1;
        snaddress to = Cairo.snaddressWrap(0x1);

        IStarklane(bridge).enableWhiteList(false);

        IStarklane(bridge).whiteList(erc721C1, true);

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
    }

    // Test event related to whitelist
    function test_events_whiteList() public {
        vm.expectEmit(bridge);
        emit WhiteListUpdated(false);
        IStarklane(bridge).enableWhiteList(false);

        vm.expectEmit(bridge);
        emit WhiteListUpdated(true);
        IStarklane(bridge).enableWhiteList(true);

        vm.expectEmit(bridge);
        emit CollectionWhiteListUpdated(erc721C1, true);
        IStarklane(bridge).whiteList(erc721C1, true);

        vm.expectEmit(bridge);
        emit CollectionWhiteListUpdated(erc721C1, false);
        IStarklane(bridge).whiteList(erc721C1, false);

    }

    function test_isWhiteListEnabled() public {
        IStarklane(bridge).enableWhiteList(false);
        assert(!IStarklane(bridge).isWhiteListEnabled());

        IStarklane(bridge).enableWhiteList(true);
        assert(IStarklane(bridge).isWhiteListEnabled());

        IStarklane(bridge).whiteList(erc721C1, true);
        assert(IStarklane(bridge).isWhiteListed(erc721C1));
        
        IStarklane(bridge).whiteList(erc721C1, false);
        assert(!IStarklane(bridge).isWhiteListed(erc721C1));
    }

    function test_getWhiteListedCollections() public {
        address[] memory whiteListed = IStarklane(bridge).getWhiteListedCollections();
        assertEq(whiteListed.length, 0);

        IStarklane(bridge).whiteList(erc721C1, true);
        IStarklane(bridge).whiteList(erc1155C1, true);
        whiteListed = IStarklane(bridge).getWhiteListedCollections();
        assertEq(whiteListed.length, 2);

        IStarklane(bridge).whiteList(erc1155C1, false);
        whiteListed = IStarklane(bridge).getWhiteListedCollections();
        assertEq(whiteListed.length, 1);
    }

    // Audit:
    // [C-01] Anyone can withdraw any token held by the L1 bridge
    function test_withdrawTokensERC721AutoWithdrawDeploy() public {
        // Build the request and compute it's "would be" message hash.
        felt252 header = Protocol.requestHeaderV1(CollectionType.ERC721, false, true);
        Request memory req = buildRequestDeploy(header, 888, bob);
        uint256[] memory reqSerialized = Protocol.requestSerialize(req);
        bytes32 msgHash = computeMessageHashFromL2(reqSerialized);

        // The message must be simulated to come from the L2 indexer and registered
        // as QUICK message.

        IStarklane(bridge).addMessageHashForAutoWithdraw(uint256(msgHash));
        vm.expectRevert(NotSupportedYetError.selector);
        IStarklane(bridge).withdrawTokens(reqSerialized);
    }

    // Test a withdraw STARKNET that will trigger the deploy of a new collection on L1.'0x800000000000011000000000000000000000000000000000000000000000001'
    function test_withdrawTokensERC721StarknetWithdrawDeploy() public {
        // Build the request and compute it's "would be" message hash.
        felt252 header = Protocol.requestHeaderV1(CollectionType.ERC721, false, false);
        Request memory req = buildRequestDeploy(header, 888, bob);
        uint256[] memory reqSerialized = Protocol.requestSerialize(req);
        bytes32 msgHash = computeMessageHashFromL2(reqSerialized);

        // The message must be simulated to come from starknet verifier contract
        // on L1 and pushed to starknet core.
        uint256[] memory hashes = new uint256[](1);
        hashes[0] = uint256(msgHash);
        IStarknetMessagingLocal(snCore).addMessageHashesFromL2(hashes);
        address collection = IStarklane(bridge).withdrawTokens(reqSerialized);

        // TODO: add verification of event emission.

        assertEq(IERC721(collection).ownerOf(888), bob);

        // Error message from Starknet Core expected.
        vm.expectRevert(bytes("INVALID_MESSAGE_TO_CONSUME"));
        IStarklane(bridge).withdrawTokens(reqSerialized);
    }

    // Audit:
    // [C-02] Impossible to withdraw L1 native tokens back on L1 after bridging to L2. Also, a different collection address will be generated for every native l2 token bridged to l1
    function test_withdrawTokensERC721StarknetWithdrawDeploySameCollection() public {
        // Build the request and compute it's "would be" message hash.
        felt252 header = Protocol.requestHeaderV1(CollectionType.ERC721, false, false);
        Request memory req = buildRequestDeploy(header, 888, bob);
        uint256[] memory reqSerialized = Protocol.requestSerialize(req);
        bytes32 msgHash = computeMessageHashFromL2(reqSerialized);

        // The message must be simulated to come from starknet verifier contract
        // on L1 and pushed to starknet core.
        uint256[] memory msgHashes = new uint256[](1);
        msgHashes[0] = uint256(msgHash);
        IStarknetMessagingLocal(snCore).addMessageHashesFromL2(msgHashes);
        address collection1 = IStarklane(bridge).withdrawTokens(reqSerialized);

        assertEq(IERC721(collection1).ownerOf(888), bob);
        // Error message from Starknet Core expected.
        vm.expectRevert(bytes("INVALID_MESSAGE_TO_CONSUME"));
        IStarklane(bridge).withdrawTokens(reqSerialized);

        req.tokenIds[0] = 777;
        reqSerialized = Protocol.requestSerialize(req);
        msgHash = computeMessageHashFromL2(reqSerialized);

        msgHashes[0] = uint256(msgHash);
        IStarknetMessagingLocal(snCore).addMessageHashesFromL2(msgHashes);
        address collection2 = IStarklane(bridge).withdrawTokens(reqSerialized);

        assertEq(IERC721(collection2).ownerOf(777), bob);
        assertEq(collection1, collection2);
    }

    function test_withdrawTokensERC721StarknetWithdrawDeployDifferentCollection() public {
        felt252 header = Protocol.requestHeaderV1(CollectionType.ERC721, false, false);
        Request memory req = buildRequestDeploy(header, 888, bob);
        uint256[] memory reqSerialized = Protocol.requestSerialize(req);
        bytes32 msgHash = computeMessageHashFromL2(reqSerialized);

        // The message must be simulated to come from starknet verifier contract
        // on L1 and pushed to starknet core.
        uint256[] memory msgHashes = new uint256[](1);
        msgHashes[0] = uint256(msgHash);
        IStarknetMessagingLocal(snCore).addMessageHashesFromL2(msgHashes);
        address collection1 = IStarklane(bridge).withdrawTokens(reqSerialized);

        assertEq(IERC721(collection1).ownerOf(888), bob);
        // Error message from Starknet Core expected.
        vm.expectRevert(bytes("INVALID_MESSAGE_TO_CONSUME"));
        IStarklane(bridge).withdrawTokens(reqSerialized);

        req.tokenIds[0] = 777;
        req.collectionL2 = Cairo.snaddressWrap(0x456);
        reqSerialized = Protocol.requestSerialize(req);
        msgHash = computeMessageHashFromL2(reqSerialized);

        msgHashes[0] = uint256(msgHash);
        IStarknetMessagingLocal(snCore).addMessageHashesFromL2(msgHashes);
        address collection2 = IStarklane(bridge).withdrawTokens(reqSerialized);

        assertEq(IERC721(collection2).ownerOf(777), bob);
        assertFalse(collection1 == collection2);
    }

    function test_withdrawTokens_deployedCollection_shall_be_whitelisted() public {
        // Build the request and compute it's "would be" message hash.
        felt252 header = Protocol.requestHeaderV1(CollectionType.ERC721, false, false);
        Request memory req = buildRequestDeploy(header, 888, bob);
        uint256[] memory reqSerialized = Protocol.requestSerialize(req);
        bytes32 msgHash = computeMessageHashFromL2(reqSerialized);

        // The message must be simulated to come from starknet verifier contract
        // on L1 and pushed to starknet core.
        uint256[] memory msgHashes = new uint256[](1);
        msgHashes[0] = uint256(msgHash);
        IStarknetMessagingLocal(snCore).addMessageHashesFromL2(msgHashes);
        address collection = IStarklane(bridge).withdrawTokens(reqSerialized);
        IStarklane(bridge).enableWhiteList(true);
        assert(IStarklane(bridge).isWhiteListEnabled());
        assert(IStarklane(bridge).isWhiteListed(collection));
    }

    function test_depositWithdrawTokens_withMapping() public {
        // add mapping L1 <-> L2: erc721C1 <-> 0x123
        IStarklane(bridge).setL1L2CollectionMapping(address(erc721C1), Cairo.snaddressWrap(0x123), true);

        // alice deposit token 0 and 9 of collection erc721C1 to bridge
        test_depositTokenERC721();

        // Build the request and compute it's "would be" message hash.
        felt252 header = Protocol.requestHeaderV1(CollectionType.ERC721, false, false);
        Request memory req = buildRequestDeploy(header, 9, bob);
        req.collectionL1 = address(erc721C1);
        uint256[] memory reqSerialized = Protocol.requestSerialize(req);
        bytes32 msgHash = computeMessageHashFromL2(reqSerialized);

        // The message must be simulated to come from starknet verifier contract
        // on L1 and pushed to starknet core.
        uint256[] memory hashes = new uint256[](1);
        hashes[0] = uint256(msgHash);
        IStarknetMessagingLocal(snCore).addMessageHashesFromL2(hashes);
        address collection = IStarklane(bridge).withdrawTokens(reqSerialized);

        // TODO: add verification of event emission.
        assertEq(collection, erc721C1);
        assertEq(IERC721(erc721C1).ownerOf(9), bob);

        // Error message from Starknet Core expected.
        vm.expectRevert(bytes("INVALID_MESSAGE_TO_CONSUME"));
        IStarklane(bridge).withdrawTokens(reqSerialized);
    }

    function test_enableBridge() public {
        IStarklane(bridge).enableBridge(true);
        assert(IStarklane(bridge).isEnabled());

        IStarklane(bridge).enableBridge(false);
        assert(!IStarklane(bridge).isEnabled());
    }

    function test_cancelRequest() public {
        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 9;

        (uint256 nonce, uint256[] memory payload) = setupCancelRequest(alice, ids);
        assert(IERC721(erc721C1).ownerOf(ids[0]) != alice);
        assert(IERC721(erc721C1).ownerOf(ids[0]) != alice);

        Request memory req = Protocol.requestDeserialize(payload, 0);

        vm.expectEmit(true, false, false, false, bridge);
        emit CancelRequestStarted(req.hash, 42);
        IStarklane(bridge).startRequestCancellation(payload, nonce);

        vm.expectEmit(true, false, false, false, bridge);
        emit CancelRequestCompleted(req.hash, 42);
        IStarklane(bridge).cancelRequest(payload, nonce);

        assert(IERC721(erc721C1).ownerOf(ids[0]) == alice);
        assert(IERC721(erc721C1).ownerOf(ids[1]) == alice);
    }

    function test_startRequestCancellation_onlyAdmin() public {
        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 9;

        (uint256 nonce, uint256[] memory payload) = setupCancelRequest(alice, ids);
        assert(IERC721(erc721C1).ownerOf(ids[0]) == bridge);
        assert(IERC721(erc721C1).ownerOf(ids[1]) == bridge);


        vm.startPrank(alice);
        vm.expectRevert();
        IStarklane(bridge).startRequestCancellation(payload, nonce);
        vm.stopPrank();

        vm.expectRevert();
        IStarklane(bridge).cancelRequest(payload, nonce);

        assert(IERC721(erc721C1).ownerOf(ids[0]) == bridge);
        assert(IERC721(erc721C1).ownerOf(ids[1]) == bridge);
    }

    function test_cancelRequest_withDelay() public {
        uint256 delay = 30;
        IStarknetMessagingLocal(snCore).setMessageCancellationDelay(delay);
        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 9;

        (uint256 nonce, uint256[] memory payload) = setupCancelRequest(alice, ids);
        assert(IERC721(erc721C1).ownerOf(ids[0]) != alice);
        assert(IERC721(erc721C1).ownerOf(ids[0]) != alice);

        Request memory req = Protocol.requestDeserialize(payload, 0);

        vm.expectEmit(true, false, false, false, bridge);
        emit CancelRequestStarted(req.hash, 42);
        IStarklane(bridge).startRequestCancellation(payload, nonce);

        vm.expectRevert();
        IStarklane(bridge).cancelRequest(payload, nonce);

        skip(delay * 1 seconds);
        IStarklane(bridge).cancelRequest(payload, nonce);

        assert(IERC721(erc721C1).ownerOf(ids[0]) == alice);
        assert(IERC721(erc721C1).ownerOf(ids[1]) == alice);
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

    function setupCancelRequest(
        address user,
        uint256[] memory tokenIds
    ) internal returns(uint256, uint256[] memory) {

        IERC721MintRangeFree(erc721C1).mintRangeFree(user, 0, 10);


        uint256 salt = 0x1;
        snaddress to = Cairo.snaddressWrap(0x1);

        vm.startPrank(user);
        IERC721(erc721C1).setApprovalForAll(bridge, true);
        vm.recordLogs();
        IStarklane(bridge).depositTokens{value: 30000}(
            salt,
            address(erc721C1),
            to,
            tokenIds,
            false
        );
        Vm.Log[] memory entries = vm.getRecordedLogs();
        vm.stopPrank();

        // Transfer - Transfer - LogMessageToL2 - DepositRequestInitialized
        assertEq(entries.length, 4);
        Vm.Log memory logMessageToL2 = entries[2];
        Vm.Log memory depositRequestEvent = entries[3];
        (uint256[] memory payload, uint256 nonce, ) = abi.decode(logMessageToL2.data, (uint256[], uint256, uint256));
        ( ,uint256[] memory reqContent) = abi.decode(depositRequestEvent.data, (uint256, uint256[]));
        assert(payload.length == reqContent.length);
        return (nonce, payload);
    }

}
