import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  const starknetCore = process.env.STARKNET_CORE_L1_ADDRESS || "";

  console.log("=> starknetCore", starknetCore);

  // Deploy Bridge
  const Bridge = await ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy(starknetCore);
  await bridge.deployed();
  console.log(`Bridge deployed to ${bridge.address}`);
  
  // Wait 5 validations before verifying
  await bridge.deployTransaction.wait(5);
  console.log(`Bridge validations complete`);
  
  // Verify Bridge on Etherscan
  // TODO: remove try catch when https://github.com/NomicFoundation/hardhat/pull/3609 is merged
  try {
    await hre.run("verify:verify", {
      address: bridge.address,
      constructorArguments: [starknetCore],
    });
  } catch (err: any) {
    if (err.message.includes("Reason: Already Verified")) {
      console.log("Contract is already verified!");
    }
  }
  console.log(`Bridge verified on Etherscan`);
  process.exit(0)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
