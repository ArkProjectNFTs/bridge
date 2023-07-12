pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/Vm.sol";

address constant HEVM_ADDRESS = address(bytes20(uint160(uint256(keccak256("hevm cheat code")))));

library Utils {
    function writeJson(string memory json, string memory fileName)
        internal {
        VmSafe vm = VmSafe(HEVM_ADDRESS);

        string memory data = vm.serializeBool(json, "success", true);
        string memory outJson = "out";
        string memory output = vm.serializeString(outJson, "data", data);

        string memory localLogs = vm.envString("LOCAL_LOGS");
        vm.createDir(localLogs, true);
        vm.writeJson(output, string.concat(localLogs, fileName));
    }
}
