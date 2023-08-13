// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

import "./Utils.sol";
import "src/Bridge.sol";
import "src/sn/Cairo.sol";
import "src/sn/StarknetMessagingLocal.sol";
import "src/token/ERC721Bridgeable.sol";

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
        // If already deployed, only upgrade and call to initialize function.
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

contract Deposit is Script {
    function setUp() public {}

    function run() public {
        Config memory config = Utils.loadConfig();

        vm.startBroadcast(config.deployerPrivateKey);

        address proxyAddress = config.starklaneL1ProxyAddress;

        uint256[] memory ids = new uint256[](2);
        ids[0] = 23;
        ids[1] = 24;

        Starklane(payable(proxyAddress)).depositTokens{value: 50000}(
            0x112233,
            0x9156d2D0aad192859888919Cb91c1270BF21D881,
            Cairo.snaddressWrap(0x01024e16519da35d35b0637c32d0611cc36b724f69cdea25e8007cd6a7cffa51),
            ids,
            false
        );

        vm.stopBroadcast();
    }
}
