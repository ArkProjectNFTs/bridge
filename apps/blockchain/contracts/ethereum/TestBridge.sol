// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./interfaces/IBridgeEscrow.sol";

contract TestBridge is Ownable {
  IBridgeEscrow escrowContract;

  constructor(address ecrowContractAddress) {
    escrowContract = IBridgeEscrow(ecrowContractAddress);
  }

  function deposit(address tokenAddress, uint tokenId, address depositorAddress) public {
    escrowContract.depositNFT(tokenAddress, tokenId, depositorAddress);
  }

  function withdraw(address tokenAddress, uint tokenId) public {
    escrowContract.withdrawDeposit(tokenAddress, tokenId);
  }

  function cancel(address tokenAddress, uint tokenId) public {
    escrowContract.cancelDeposit(tokenAddress, tokenId);
  }
}
