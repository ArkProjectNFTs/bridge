const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Bridge", function () {
  let bridge;
  let bridgeEscrow;
  let nftCollection;
  let admin;
  let owner;
  let user;

  beforeEach(async function () {
    [admin, owner, user] = await ethers.getSigners();

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
    const tokenId = 10;
    const contract = nftCollection.connect(owner);
    await contract.mint(owner.address, tokenId);

    const escrowContractAddress = await bridge.escrowContract();
    await contract.setApprovalForAll(escrowContractAddress, true);

    const bridgeContract = bridge.connect(owner);
    await bridgeContract.connect(admin).setSelector(0x01);
    await bridgeContract.depositTokenFromL1ToL2(nftCollection.address, 0x0, tokenId);
  });
});
