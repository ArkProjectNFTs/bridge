// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

import "./Utils.sol";
import "src/Bridge.sol";
import "src/StarknetMessagingLocal.sol";
import "src/ERC721Bridgeable.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";


contract Deploy is Script {
    function setUp() public {}

    function run() public {
        Config memory config = Utils.loadConfig();
        
        vm.startBroadcast(config.deployerPrivateKey);

        address snCoreAddress = config.starknetCoreAddress;
        if (snCoreAddress == address(0x0)) {
            snCoreAddress = address(new StarknetMessagingLocal());
        }

        address impl = address(new Starklane());
        
        bytes memory dataInit = abi.encodeWithSelector(
            Starklane.initialize.selector,
            abi.encode(
                config.deployerAddress,
                config.starknetCoreAddress,
                config.starklaneL2Address,
                config.starklaneL2Selector
            )
        );

        address proxyAddress = config.starklaneL1ProxyAddress;

        // Depending on the configuration, the proxy is also deployed.
        // If already deployed, only the upgrade and call to initialize function.
        if (proxyAddress == address(0x0)) {
            proxyAddress = address(new ERC1967Proxy(impl, dataInit));
        } else {
            Starklane(payable(proxyAddress)).upgradeToAndCall(impl, dataInit);
        }

        vm.stopBroadcast();

        string memory json = "starklane_deploy";
        vm.serializeString(json, "proxy_address", vm.toString(proxyAddress));
        vm.serializeString(json, "impl_address", vm.toString(impl));
        vm.serializeString(json, "sncore_address", vm.toString(snCoreAddress));
        Utils.writeJson(json, "starklane_deploy.json");
    }
}
