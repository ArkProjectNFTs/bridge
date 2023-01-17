// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./interfaces/IStarknetMessaging.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Bridge is Ownable {
    IStarknetMessaging public starknetCore;
    uint256 private CLAIM_SELECTOR;
    uint256 private L2ContractAddress;

    constructor(address starknetCore_) {
        require(
            starknetCore_ != address(0),
            "Gateway/invalid-starknet-core-address"
        );
        starknetCore = IStarknetMessaging(starknetCore_);
    }

    function setClaimSelector(uint256 _claimSelector) external onlyOwner {
        CLAIM_SELECTOR = _claimSelector;
    }

    function setL2ContractAddress(
        uint256 _L2ContractAddress
    ) external onlyOwner {
        L2ContractAddress = _L2ContractAddress;
    }

    function claim(
        address l1_contract_address, uint256 tokenId, uint256 l2_owner_address, 
        uint256 amount
        ) payable public {
        uint256[] memory payload = new uint256[](5);
        payload[0] = uint256(uint160(msg.sender));
        payload[1] = l2_owner_address;
        payload[2] = uint256(uint160(l1_contract_address));
        payload[3] = tokenId;
        payload[4] = amount;
        starknetCore.sendMessageToL2{ value: msg.value}(
            L2ContractAddress,
            CLAIM_SELECTOR,
            payload
        );
    }
}
