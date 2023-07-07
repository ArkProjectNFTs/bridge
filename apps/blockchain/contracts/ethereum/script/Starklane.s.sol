// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import "src/Bridge.sol";
import "src/ERC721Bridgeable.sol";

contract Starklane is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.envAddress("EOA_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        ERC721Bridgeable c1 = new ERC721Bridgeable("token1", "UN");
        c1.testMint(deployerAddress, 55);
        console.log("C1");
        console.log(address(c1));

        ERC721Bridgeable c2 = new ERC721Bridgeable("token2", "DEUX");
        c2.testMint(deployerAddress, 22);
        console.log(address(c2));

        vm.stopBroadcast();

        string memory tokens_json = "tokens";
        vm.serializeString(tokens_json, "c1", vm.toString(address(c1)));
        string memory output = vm.serializeString(tokens_json, "c2", vm.toString(address(c2)));

        vm.createDir("./local/logs", true);
        vm.writeJson(output, "./local/logs/tokens.json");
    }
}

// PRIVATE_KEY=0x402c81c9a7d39e6223e64566b8d3299ffd23297e21e85102772b7bc3b089e5a7
