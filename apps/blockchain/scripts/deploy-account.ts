import { starknet } from "hardhat";

async function keypress() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  return new Promise<void>((resolve) =>
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      resolve();
    })
  );
}

(async () => {
  const account = await starknet.OpenZeppelinAccount.createAccount({
    salt: process.env.L2_DEPLOYER_SALT,
    privateKey: process.env.L2_DEPLOYER_PRIVATE_KEY,
  });
  console.log(
    `Account created at ${account.address} with private key=${account.privateKey} and public key=${account.publicKey}`
  );
  console.log(
    "Please fund the address. Even after you get a confirmation that the funds were transferred, you may want to wait for a couple of minutes."
  );
  console.log("Press any key to continue...");
  await keypress();
  console.log("Deploying...");
  await account.deployAccount({ maxFee: 1e18 });
  console.log("Deployed");
  process.exit(0);
})()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
