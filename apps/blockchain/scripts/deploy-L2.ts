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
  console.log("L2 deployer address: ", L2_DEPLOYER_ADDRESS);

  console.log("Getting OpenZepplin Account...");
  const deployerAccount = await getOZAccount();
  console.log("Declaring hash...");

  const defaultTokenContractFactory = await starknet.getContractFactory(
    "default_token"
  );
  const defaultTokenClasshash = await deployerAccount.declare(
    defaultTokenContractFactory
  );

  const bridgeContractFactory = await starknet.getContractFactory("bridge");
  const bridgeClasshash = await deployerAccount.declare(bridgeContractFactory, {
    maxFee,
  });

  console.log("L2 bridge class is declared at hash: ", bridgeClasshash);
  console.log("Deploying contract...");

  const contract = await deployerAccount.deploy(
    bridgeContractFactory,
    {
      owner: 0x004febf0e16616092df71a707615cbe8f89046787688fcfa2e778e0a99b77d9f,
      class_hash: defaultTokenClasshash,
      initial_salt: 0,
      udc_contract: 0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf,
    },
    { maxFee }
  );

  console.log("Deployed to:", contract.address);
  process.exit(0);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
