import * as dotenv from "dotenv";
import { ethers, starknet } from "hardhat";

dotenv.config();

async function main() {}

async function deployStarknetContracts() {
  const account = await starknet.OpenZeppelinAccount.getAccountFromAddress(
    process.env.ACCOUNT || "",
    process.env.PRIVATE_KEY || ""
  );

  const DefaultToken = await starknet.getContractFactory(
    "./contracts/starknet/default_token"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
