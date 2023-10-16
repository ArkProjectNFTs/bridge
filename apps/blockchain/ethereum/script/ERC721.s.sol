// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

import "./Utils.sol";
import "src/token/ERC721Bridgeable.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";


contract Deploy is Script {

    function setUp() public {
    }

    function run() public {
        Config memory config = Utils.loadConfig();
        
        vm.startBroadcast(config.deployerPrivateKey);

        address impl = address(new ERC721Bridgeable());
        
        bytes memory dataInit = abi.encodeWithSelector(
            ERC721Bridgeable.initialize.selector,
            abi.encode(
                "everai_123",
                "EVR_123"
            )
        );

        address proxyAddress = vm.envAddress("ERC721_PROXY_ADDRESS");

        if (proxyAddress == address(0x0)) {
            proxyAddress = address(new ERC1967Proxy(impl, dataInit));
        } else {
            ERC721Bridgeable(payable(proxyAddress)).upgradeToAndCall(impl, dataInit);
        }

        vm.stopBroadcast();

        string memory json = "erc721_deploy";
        vm.serializeString(json, "proxy_address", vm.toString(proxyAddress));
        vm.serializeString(json, "impl_address", vm.toString(impl));
        Utils.writeJson(json, "erc721_deploy.json");
    }
}
