// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract TestStarknetCore {
  function sendMessageToL2(
    uint256 toAddress,
    uint256 selector,
    uint256[] calldata payload
  ) external payable returns (bytes32, uint256) {
    uint256 u1 = toAddress + selector;
    return (bytes32(payload.length), u1);
  }
}
