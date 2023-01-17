import { ethers } from "hardhat";

async function main() {
  const starknetCore = process.env.STARKNET_CORE_L1_ADDRESS || "";
  const Bridge = await ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy(starknetCore);  
  await bridge.deployed();
  console.log(`deployed to ${bridge.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
