const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Bridge", function () {
  let bridge;
  let bridgeEscrow;
  let nftCollection;

  let admin;
  let owner;
  let addr2;

  beforeEach(async function () {
    [admin, owner, addr2] = await ethers.getSigners();

    const starknetCoreFactory = await ethers.getContractFactory("TestStarknetCore");
    const starknetCore = await starknetCoreFactory.deploy();

    const bridgeEscrowFactory = await ethers.getContractFactory("BridgeEscrow");
    bridgeEscrow = await bridgeEscrowFactory.deploy();

    const bridgeFactory = await ethers.getContractFactory("Bridge");
    bridge = await bridgeFactory.deploy(starknetCore.address, bridgeEscrow.address);
    await bridge.deployed();

    await bridgeEscrow.grantBridgeRole(bridge.address);

    const erc721ContractFactory = await ethers.getContractFactory("TestERC721");
    nftCollection = await erc721ContractFactory.deploy("Test", "Test");
    await nftCollection.deployed();
  });

  it("should have the right access role on the escrow contract", async () => {
    const bridgeRole = await bridgeEscrow.BRIDGE_ROLE();
    const hasRole = await bridgeEscrow.hasRole(bridgeRole, bridge.address);
    expect(hasRole).to.equal(true);
  });

  it("should deposit token from L1", async () => {
    // const l2OwnerAddress = "0x07a096EcAa08A3a50dc2E1283C38586C497e0e684648aB2ABe02427E2aFe1e77";
    const tokenId = 10;
    await nftCollection.approve(bridge.address, tokenId);
    await nftCollection.mint(owner.address, tokenId);
    await bridge.depositTokenFromL1ToL2(nftCollection.address, 0x0, tokenId);
  });
});
