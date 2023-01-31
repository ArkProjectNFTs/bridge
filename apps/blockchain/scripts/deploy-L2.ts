import * as dotenv from "dotenv";
import { starknet } from "hardhat";

dotenv.config();

const maxFee = 5e16;

const { L2_DEPLOYER_ADDRESS = "", L2_DEPLOYER_PRIVATE_KEY = "" } = process.env;

export async function getOZAccount() {
  return await starknet.OpenZeppelinAccount.getAccountFromAddress(
    L2_DEPLOYER_ADDRESS,
    L2_DEPLOYER_PRIVATE_KEY
  );
}

async function main() {
  if (!L2_DEPLOYER_ADDRESS || !L2_DEPLOYER_PRIVATE_KEY) {
    throw new Error(
      "Please set your L2 deployer private key & address in your .env file"
    );
  }
  console.log("Deploying L2 bridge...");
  console.log(
    "L2 deployer address: ",
    L2_DEPLOYER_ADDRESS,
  );
  const contractFactory = await starknet.getContractFactory("bridge");
  console.log("Getting OpenZepplin Account...");
  const deployerAccount = await getOZAccount();
  console.log("Declaring hash...");
  const bridgeImplHash = await deployerAccount.declare(contractFactory, {
    maxFee,
  });
  console.log("L2 bridge class is declared at hash: ", bridgeImplHash);
  console.log("Deploying contract...");
  const contract = await deployerAccount.deploy(contractFactory, {});
  console.log("Deployed to:", contract.address);
  process.exit(0); 
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
