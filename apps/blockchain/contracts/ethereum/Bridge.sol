// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./interfaces/IStarknetMessaging.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface NFTContract is IERC721 {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract Bridge is Ownable {
    IStarknetMessaging public starknetCore;
    uint256 public selector;
    uint256 public l2GatewayAddress;

    constructor(address starknetCore_) {
        require(
            starknetCore_ != address(0),
            "Gateway/invalid-starknet-core-address"
        );
        starknetCore = IStarknetMessaging(starknetCore_);
    }

    function setSelector(uint256 value) external onlyOwner {
        selector = value;
    }

    function setL2GatewayAddress(uint256 value) external onlyOwner {
        l2GatewayAddress = value;
    }

    function strToUint(string memory text) public pure returns (uint256 res) {
        bytes32 stringInBytes32 = bytes32(bytes(text));
        uint256 strLen = bytes(text).length; // TODO: cannot be above 32
        require(strLen <= 32, "String cannot be longer than 32");

        uint256 shift = 256 - 8 * strLen;

        uint256 stringInUint256;
        assembly {
            stringInUint256 := shr(shift, stringInBytes32)
        }
        return stringInUint256;
    }

    function deposit(
        address l1TokenAddress,
        uint256 l2OwnerAddress,
        uint256 tokenId
    ) public payable {
        NFTContract tokenContract = NFTContract(l1TokenAddress);

        // optimistic transfer, should revert if no approved or not owner
        tokenContract.transferFrom(msg.sender, address(this), tokenId);

        string memory symbol = tokenContract.symbol();
        string memory name = tokenContract.name();
        string memory tokenUri = tokenContract.tokenURI(tokenId);

        uint256[] memory payload = new uint256[](6);

        payload[0] = uint256(uint160(l1TokenAddress)); // l1_contract_address
        payload[1] = l2OwnerAddress; // to
        payload[2] = tokenId;
        payload[3] = strToUint(name);
        payload[4] = strToUint(symbol);
        payload[5] = strToUint(tokenUri);

        starknetCore.sendMessageToL2{value: msg.value}(
            l2GatewayAddress,
            selector,
            payload
        );
    }

    // TO REMOVE
    function forceWithdraw(address l1_contract_address, uint256 tokenId)
        public
        onlyOwner
    {
        IERC721 tokenContract = NFTContract(l1_contract_address);
        tokenContract.transferFrom(address(this), msg.sender, tokenId);
    }
}
