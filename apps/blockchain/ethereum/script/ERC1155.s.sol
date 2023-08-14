// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

import "./Utils.sol";
import "src/token/ERC1155Bridgeable.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";


contract Deploy is Script {

    function setUp() public {
    }

    function run() public {
        Config memory config = Utils.loadConfig();
        
        vm.startBroadcast(config.deployerPrivateKey);

        address impl = address(new ERC1155Bridgeable());
        
        bytes memory dataInit = abi.encodeWithSelector(
            ERC1155Bridgeable.initialize.selector,
            abi.encode("")
        );

        address proxyAddress = vm.envAddress("ERC1155_PROXY_ADDRESS");

        if (proxyAddress == address(0x0)) {
            proxyAddress = address(new ERC1967Proxy(impl, dataInit));
        } else {
            ERC1155Bridgeable(payable(proxyAddress)).upgradeToAndCall(impl, dataInit);
        }

        vm.stopBroadcast();

        string memory json = "erc1155_deploy";
        vm.serializeString(json, "proxy_address", vm.toString(proxyAddress));
        vm.serializeString(json, "impl_address", vm.toString(impl));
        Utils.writeJson(json, "erc1155_deploy.json");
    }
}
