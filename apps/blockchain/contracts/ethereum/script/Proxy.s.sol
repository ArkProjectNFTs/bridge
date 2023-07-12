// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import "./Utils.sol";

import "src/proxy/StarklaneAdmin.sol";

/*
 *
 */
contract UpgradeImplementation is Script {
    function setUp() public {}

    function run() public {
    }
}

/*
 *
 */
contract ProxyDeploy is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        //address adminAddress = vm.envAddress("EOA_ADDRESS");
        address logicAddress = vm.envAddress("BRIDGE_L1_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        StarklaneProxy proxy = new StarklaneProxy(logicAddress);

        vm.stopBroadcast();

        string memory json = "admin";
        vm.serializeString(json, "proxy_address", vm.toString(address(proxy)));
        vm.serializeString(json, "implem_address", vm.toString(address(logicAddress)));

        Utils.writeJson(json, "proxy_and_admin.json");
    }
}
