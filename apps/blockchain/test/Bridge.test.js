const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Bridge", function () {
  let bridge;
  let starknetCore;

  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const starknetCoreFactory = await ethers.getContractFactory("TestStarknetCore");
    starknetCore = await starknetCoreFactory.deploy();

    // const bridgeFactory = await ethers.getContractFactory("Bridge");
    // bridge = await bridgeFactory.deploy(starknetCore.address, "<ESCROW_CONTRACT_ADDRESS>");
    // await bridge.deployed();
  });

  //   it("should deposit token from L1 to L2", async function () {
  //     const l1TokenAddress = "<L1_TOKEN_ADDRESS>";
  //     const l2OwnerAddress = 1234;
  //     const tokenId = 1;

  //     // Mock the IBridgeEscrow contract
  //     const MockEscrow = await ethers.getContractFactory("MockEscrow");
  //     const mockEscrow = await MockEscrow.deploy();
  //     await mockEscrow.deployed();

  //     // Deposit NFT in IBridgeEscrow
  //     await mockEscrow.depositNFT(l1TokenAddress, tokenId, owner.address);

  //     // Mock the IStarknetMessaging contract
  //     const MockStarknetMessaging = await ethers.getContractFactory("MockStarknetMessaging");
  //     const mockStarknetMessaging = await MockStarknetMessaging.deploy();
  //     await mockStarknetMessaging.deployed();

  //     // Send message to L2 using IStarknetMessaging
  //     const payload = [
  //       ethers.utils.hexlify(l1TokenAddress),
  //       l2OwnerAddress,
  //       tokenId,
  //       ethers.utils.hexlify("MyToken"),
  //       ethers.utils.hexlify("MTK"),
  //       ethers.utils.hexlify("https://mytoken.com/token/1"),
  //     ];
  //     await mockStarknetMessaging.sendMessageToL2("<L2_GATEWAY_ADDRESS>", "<SELECTOR>", payload, { value: 100 });

  //     // Call depositTokenFromL1ToL2 function
  //     await expect(
  //       bridge.depositTokenFromL1ToL2(l1TokenAddress, l2OwnerAddress, tokenId, {
  //         value: 100,
  //       }),
  //     ).to.emit(mockStarknetMessaging, "SendMessageToL2");

  //     // Check that the deposit was made in the IBridgeEscrow contract
  //     expect(await mockEscrow.getEscrowedNFT(l1TokenAddress, tokenId)).to.equal(owner.address);
  //   });
});
