// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

import "./Utils.sol";


import "src/sn/StarknetMessagingLocal.sol";

contract LocalMessaging is Script {
    function setUp() public {}

    function run() public {
        Config memory config = Utils.loadConfig();
        
        string memory json = "local_messaging";
        vm.startBroadcast(config.deployerPrivateKey);

        address snCoreAddress = address(new StarknetMessagingLocal());
        vm.stopBroadcast();
        vm.serializeString(json, "sncore_address", vm.toString(snCoreAddress));

        Utils.writeJson(json, "local_messaging_deploy.json");
    }
}