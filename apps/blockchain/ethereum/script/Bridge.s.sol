// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import "./Utils.sol";
import "src/Bridge.sol";
import "src/ERC721Bridgeable.sol";

contract Deploy is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("ACCOUNT_PRIVATE_KEY");
        console.log(deployerPrivateKey);

        address starknetCoreAddress = vm.envAddress("STARKNET_CORE_L1_ADDRESS");
        uint256 bridgeL2Address = vm.envUint("BRIDGE_L2_ADDRESS");
        uint256 bridgeL2Selector = vm.envUint("BRIDGE_L2_SELECTOR");

        vm.startBroadcast(deployerPrivateKey);

        Bridge b = new Bridge();
        b.setStarknetCoreAddress(starknetCoreAddress);
        b.setBridgeL2Address(bridgeL2Address);
        b.setBridgeL2Selector(bridgeL2Selector);

        vm.stopBroadcast();

        string memory json = "bridge_deploy";
        vm.serializeString(json, "bridge_address", vm.toString(address(b)));

        Utils.writeJson(json, "bridge_deploy.json");
    }
}
