const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;

describe("BridgeEscrow", function () {
  let BridgeEscrow, bridgeEscrow, owner, depositor;

  beforeEach(async function () {
    BridgeEscrow = await ethers.getContractFactory("BridgeEscrow");
    var signers = await ethers.getSigners();

    owner = signers[0];
    depositor = signers[1];

    bridgeEscrow = await BridgeEscrow.deploy();
    const contract = await bridgeEscrow.deployed();

    console.log("-> BridgeEscrow deployed to:", contract.address);
  });

  describe("depositNFT", function () {
    it("should deposit an NFT to the escrow", async function () {
      const TestERC721 = await ethers.getContractFactory("TestERC721");
      const testERC721 = await TestERC721.deploy("Test Token", "TT");
      await testERC721.deployed();

      const TestBridge = await ethers.getContractFactory("TestBridge");
      const testBridge = await TestBridge.deploy(bridgeEscrow.address);
      await testBridge.deployed();

      console.log("-> TestERC721 deployed to:", testERC721.address);

      const tokenId = BigNumber.from(1);
      await testERC721.mint(depositor.address, tokenId);
      await testERC721
        .connect(depositor)
        .approve(bridgeEscrow.address, tokenId);

      const transaction = await testBridge.deposit(
        testERC721.address,
        tokenId,
        depositor.address
      );

      await expect(transaction)
        .to.emit(bridgeEscrow, "TokenTransfered")
        .withArgs(
          1,
          tokenId,
          testERC721.address,
          depositor.address,
          testBridge.address,
          (
            await ethers.provider.getBlock("latest")
          ).timestamp,
          0
        );
    });
  });

  describe("withdrawDeposit", function () {
    it("should withdraw the NFT deposit from the escrow", async function () {
      const TestERC721 = await ethers.getContractFactory("TestERC721");
      const testERC721 = await TestERC721.deploy("Test Token", "TT");
      await testERC721.deployed();

      const TestBridge = await ethers.getContractFactory("TestBridge");
      const testBridge = await TestBridge.deploy(bridgeEscrow.address);
      await testBridge.deployed();

      const tokenId = BigNumber.from(1);
      await testERC721.mint(depositor.address, tokenId);
      await testERC721
        .connect(depositor)
        .approve(bridgeEscrow.address, tokenId);

      await testBridge.deposit(testERC721.address, tokenId, depositor.address);
      const latestBlock = await ethers.provider.getBlock("latest");
      const withdrawTransaction = await testBridge.withdraw(
        testERC721.address,
        tokenId
      );

      await expect(withdrawTransaction)
        .to.emit(bridgeEscrow, "TokenTransfered")
        .withArgs(
          1,
          tokenId,
          testERC721.address,
          depositor.address,
          testBridge.address,
          latestBlock.timestamp,
          1
        );
    });

    //   it("should fail if the caller is not the depositor", async function () {
    //     const TestERC721 = await ethers.getContractFactory("TestERC721");
    //     const testERC721 = await TestERC721.deploy("Test Token", "TT");
    //     await testERC721.deployed();

    //     const tokenId = BigNumber.from(1);
    //     await testERC721.mint(depositor.address, tokenId);
    //     await testERC721
    //       .connect(depositor)
    //       .approve(bridgeEscrow.address, tokenId);

    //     await bridgeContract.connect(depositor).sendTransaction({
    //       to: bridgeEscrow.address,
    //       data: bridgeEscrow.interface.encodeFunctionData("depositNFT", [
    //         tokenId,
    //         testERC721.address,
    //         depositor.address,
    //       ]),
    //     });

    //     await expect(
    //       bridgeEscrow.connect(owner).withdrawDeposit(testERC721.address, tokenId)
    //     ).to.be.revertedWith("Only the sender can withdraw the NFT.");
    //   });

    //   it("should fail if the deposit status is not Locked", async function () {
    //     const TestERC721 = await ethers.getContractFactory("TestERC721");
    //     const testERC721 = await TestERC721.deploy("Test Token", "TT");
    //     await testERC721.deployed();

    //     const tokenId = BigNumber.from(1);
    //     await testERC721.mint(depositor.address, tokenId);
    //     await testERC721
    //       .connect(depositor)
    //       .approve(bridgeEscrow.address, tokenId);

    //     await bridgeContract.connect(depositor).sendTransaction({
    //       to: bridgeEscrow.address,
    //       data: bridgeEscrow.interface.encodeFunctionData("depositNFT", [
    //         tokenId,
    //         testERC721.address,
    //         depositor.address,
    //       ]),
    //     });

    //     await bridgeEscrow
    //       .connect(owner)
    //       .cancelDeposit(testERC721.address, tokenId);

    //     await expect(
    //       bridgeEscrow
    //         .connect(depositor)
    //         .withdrawDeposit(testERC721.address, tokenId)
    //     ).to.be.revertedWith("Invalid deposit status.");
    //   });
    // });

    // describe("cancelDeposit", function () {
    //   // Add test cases for the cancelDeposit function
  });
});
