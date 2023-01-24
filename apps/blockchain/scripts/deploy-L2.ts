import * as dotenv from "dotenv";
import { ethers, starknet } from "hardhat";
import { Account } from "hardhat/types";

dotenv.config();

const { L2_DEPLOYER_ADDRESS = "", L2_DEPLOYER_PRIVATE_KEY = "" } = process.env;

async function main() {
  // const DefaultToken = await starknet.getContractFactory(
  //   "./contracts/starknet/default_token"
  // );

  console.log(
    "=> L2_DEPLOYER_ADDRESS",
    L2_DEPLOYER_ADDRESS,
    L2_DEPLOYER_PRIVATE_KEY
  );

  const deployerAccount =
    await starknet.OpenZeppelinAccount.getAccountFromAddress(
      L2_DEPLOYER_ADDRESS,
      L2_DEPLOYER_PRIVATE_KEY
    );

  console.log("=> deployerAccount", deployerAccount);

  // let l2deployer = await starknet.OpenZeppelinAccount.getAccountFromAddress(
  //   L2_DEPLOYER_ADDRESS,
  //   L2_DEPLOYER_PRIVATE_KEY
  // );

  // const l2Bridge = await deployL2Bridge(l2deployer);
}

// async function deployL2Bridge(deployer: Account) {
//   const L2BridgeFactory = await starknet.getContractFactory("bridge");
//   const bridgeImplHash = await deployer.declare(L2BridgeFactory);

//   return null;
// }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
