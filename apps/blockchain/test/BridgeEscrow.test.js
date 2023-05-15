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

      await bridgeEscrow.grantBridgeRole(testBridge.address);

      const tokenId = BigNumber.from(1);
      await testERC721.mint(depositor.address, tokenId);
      await testERC721.connect(depositor).approve(bridgeEscrow.address, tokenId);

      const transaction = await testBridge.deposit(testERC721.address, tokenId, depositor.address);

      await expect(transaction)
        .to.emit(bridgeEscrow, "TokenTransferred")
        .withArgs(
          1,
          tokenId,
          testERC721.address,
          depositor.address,
          testBridge.address,
          (
            await ethers.provider.getBlock("latest")
          ).timestamp,
          0,
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

      await bridgeEscrow.grantBridgeRole(testBridge.address);

      const tokenId = BigNumber.from(1);
      await testERC721.mint(depositor.address, tokenId);
      await testERC721.connect(depositor).approve(bridgeEscrow.address, tokenId);

      await testBridge.deposit(testERC721.address, tokenId, depositor.address);
      const latestBlock = await ethers.provider.getBlock("latest");
      const withdrawTransaction = await testBridge.withdraw(testERC721.address, tokenId);

      await expect(withdrawTransaction)
        .to.emit(bridgeEscrow, "TokenTransferred")
        .withArgs(1, tokenId, testERC721.address, depositor.address, testBridge.address, latestBlock.timestamp, 1);
    });

    it("should fail if the caller is not the depositor", async function () {
      const TestERC721 = await ethers.getContractFactory("TestERC721");
      const testERC721 = await TestERC721.deploy("Test Token", "TT");
      await testERC721.deployed();

      const tokenId = BigNumber.from(1);
      await testERC721.mint(depositor.address, tokenId);
      await testERC721.connect(depositor).approve(bridgeEscrow.address, tokenId);

      const TestBridge = await ethers.getContractFactory("TestBridge");
      const testBridge = await TestBridge.deploy(bridgeEscrow.address);
      await testBridge.deployed();

      await bridgeEscrow.grantBridgeRole(testBridge.address);

      await testBridge.connect(depositor).deposit(testERC721.address, tokenId, depositor.address);

      await expect(bridgeEscrow.connect(depositor).withdrawDeposit(testERC721.address, tokenId)).to.be.revertedWith(
        "Caller is not the bridge contract",
      );
    });

    it("should fail in case of double withdraw", async function () {
      const TestERC721 = await ethers.getContractFactory("TestERC721");
      const testERC721 = await TestERC721.deploy("Test Token", "TT");
      await testERC721.deployed();

      const tokenId = BigNumber.from(1);
      await testERC721.mint(depositor.address, tokenId);
      await testERC721.connect(depositor).approve(bridgeEscrow.address, tokenId);

      const TestBridge = await ethers.getContractFactory("TestBridge");
      const testBridge = await TestBridge.deploy(bridgeEscrow.address);
      await testBridge.deployed();

      await bridgeEscrow.grantBridgeRole(testBridge.address);

      await testBridge.connect(depositor).deposit(testERC721.address, tokenId, depositor.address);

      await testBridge.connect(depositor).withdraw(testERC721.address, tokenId);

      await expect(testBridge.connect(depositor).withdraw(testERC721.address, tokenId)).to.be.revertedWith(
        "Deposit status is not locked",
      );
    });
  });

  describe("cancelDeposit", function () {
    it("should fail if the caller is not the depositor", async function () {
      const TestERC721 = await ethers.getContractFactory("TestERC721");
      const testERC721 = await TestERC721.deploy("Test Token", "TT");
      await testERC721.deployed();

      const tokenId = BigNumber.from(1);
      await testERC721.mint(depositor.address, tokenId);
      await testERC721.connect(depositor).approve(bridgeEscrow.address, tokenId);

      const TestBridge = await ethers.getContractFactory("TestBridge");
      const testBridge = await TestBridge.deploy(bridgeEscrow.address);
      await testBridge.deployed();

      await bridgeEscrow.grantBridgeRole(testBridge.address);

      await testBridge.connect(depositor).deposit(testERC721.address, tokenId, depositor.address);

      await expect(bridgeEscrow.connect(depositor).withdrawDeposit(testERC721.address, tokenId)).to.be.revertedWith(
        "Caller is not the bridge contract",
      );
    });
  });
});
