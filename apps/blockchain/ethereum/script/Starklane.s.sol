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
            0xC3e6f1F1d9d76A07E87b1F9625021a33efdbEa21,
            Cairo.snaddressWrap(0x02d34A8edAdDBc0D6E6B10e4fd833d5A5A2161282aaDB3cA3d57f57820437C2A),
            ids,
            false
        );

        vm.stopBroadcast();
    }
}

contract WithdrawSN is Script {
    function setUp() public {}

    function run() public {
        Config memory config = Utils.loadConfig();

        vm.startBroadcast(config.deployerPrivateKey);

        address proxyAddress = config.starklaneL1ProxyAddress;

        uint256[] memory buf = new uint256[](21);
        buf[0] = 257;
        buf[1] = 157109796990335246573763232927628717774;
        buf[2] = 36809199904600870044403989700573533027;
        buf[3] = 0;
        buf[4] = 1530138567501442454218839542491331524400566329265365463560792648116878965926;
        buf[5] = 1260237688642687788759567135567789255041174512757;
        buf[6] = 456385480641843693338102106303024284830032106430299072071775148436454636113;
        buf[7] = 1;
        buf[8] = 113715322580273;
        buf[9] = 1;
        buf[10] = 1196182833;
        buf[11] = 1;
        buf[12] = 0;
        buf[13] = 1;
        buf[14] = 20;
        buf[15] = 0;
        buf[16] = 0;
        buf[17] = 1;
        buf[18] = 1;
        buf[19] = 0;
        buf[20] = 0;

        Starklane(payable(proxyAddress)).withdrawTokens(buf);

        vm.stopBroadcast();
    }
}
