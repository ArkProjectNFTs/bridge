// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import "./Utils.sol";
import "src/Bridge.sol";
import "src/StarknetMessaging.sol";
import "src/ERC721Bridgeable.sol";


contract DeployERC721B is Script {
    function setUp() public {}

    function run() public {
        address deployerAddress = vm.envAddress("ACCOUNT_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("ACCOUNT_PRIVATE_KEY");

        // Change as necesary.
        address bridgeL1Address = address(0);

        vm.startBroadcast(deployerPrivateKey);

        ERC721Bridgeable collection = new ERC721Bridgeable("yoyo 721", "YOYO721");
        collection.setApprovalForAll(address(bridgeL1Address), true);
        collection.testMintRange(deployerAddress, 1, 10);

        vm.stopBroadcast();
    }
}

contract DeployAllLocal is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("ACCOUNT_PRIVATE_KEY");
        address deployerAddress = vm.envAddress("ACCOUNT_ADDRESS");

        uint256 ownerL2Address = vm.envUint("OWNER_L2_ADDRESS");
        uint256 bridgeL2Address = vm.envUint("BRIDGE_L2_ADDRESS");
        uint256 bridgeL2Selector = vm.envUint("BRIDGE_L2_SELECTOR");

        vm.startBroadcast(deployerPrivateKey);

        StarknetMessaging sn = new StarknetMessaging();

        Bridge b = new Bridge();
        b.setStarknetCoreAddress(address(sn));

        if (bridgeL2Address != 0) {
            b.setBridgeL2Address(bridgeL2Address);
        }

        if (bridgeL2Selector != 0) {
            b.setBridgeL2Selector(bridgeL2Selector);
        }

        ERC721Bridgeable collection = new ERC721Bridgeable("aaaa", "AAAJ");
        collection.setApprovalForAll(address(b), true);
        collection.testMintRange(deployerAddress, 1, 20);

        if (ownerL2Address != 0) {
            uint256 reqHash = 0x88991122;
            address collectionAddress = address(collection);

            uint256[] memory tokensIds = new uint256[](1);
            tokensIds[0] = 1;

            b.depositTokens{value: 50000}(reqHash, collectionAddress, ownerL2Address, tokensIds);
        }

        vm.stopBroadcast();

        string memory json = "local_deploy";
        vm.serializeString(json, "starknet_messaging_addr", vm.toString(address(sn)));
        vm.serializeString(json, "bridge_addr", vm.toString(address(b)));
        vm.serializeString(json, "erc721_addr", vm.toString(address(collection)));

        Utils.writeJson(json, "local_deploy.json");
    }
}

contract TestDeposit is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address bridgeL1Address = vm.envAddress("BRIDGE_L1_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        Bridge b = Bridge(bridgeL1Address);

        uint256 reqHash = 0x88991122;
        address collectionAddress = 0x14F12b8dDBbE5f03E301e876Fc3189E236D8bCd2;
        uint256 ownerL2Address = 0x07c0ea427ddca72a6bdd66746e9c0c0651e5eac76977ab9b7bbf796a410f8929;
        uint256[] memory tokensIds = new uint256[](1);
        tokensIds[0] = 2;

        b.depositTokens{value: 50000}(reqHash, collectionAddress, ownerL2Address, tokensIds);

        vm.stopBroadcast();
    }
}

contract ChangeL2Data is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("ACCOUNT_PRIVATE_KEY");
        address bridgeL1Address = vm.envAddress("BRIDGE_L1_ADDRESS");
        uint256 bridgeL2Selector = vm.envUint("BRIDGE_L2_SELECTOR");

        vm.startBroadcast(deployerPrivateKey);

        Bridge b = Bridge(bridgeL1Address);
        b.setBridgeL2Selector(bridgeL2Selector);

        vm.stopBroadcast();
    }
}
