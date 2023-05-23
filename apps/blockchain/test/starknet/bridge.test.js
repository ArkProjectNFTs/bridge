/* eslint-disable turbo/no-undeclared-env-vars */
const expect = require("chai").expect;
const starknet = require("hardhat").starknet;

let account;

describe("Bridge", function () {
  before(async function () {
    account = await starknet.OpenZeppelinAccount.createAccount({
      salt: "0x42",
      privateKey: process.env.STARKNET_ACCOUNT_PRIVATE_KEY,
      initial_balance: 10,
    });
  });

  it("should declare class and deploy", async function () {
    // console.log("=> starknet.OpenZeppelinAccount", starknet.OpenZeppelinAccount.getAccount);
    // // not compatible with accounts deployed with Starknet CLI
    // console.log("=> accountAddress", accountAddress);
    // const account = await starknet.OpenZeppelinAccount.getAccountFromAddress(accountAddress);

    const bridgeFactory = await starknet.getContractFactory("bridge");

    // const txHash = await account.declare(bridgeFactory);
    // console.log("=> txHash", txHash);

    // const classHash = await contractFactory.getClassHash();
    // const constructorArgs = { initial_balance: 0 };
    // const options = { maxFee: ... };
    // // implicitly invokes UDC
    // const contract = await account.deploy(contractFactory, constructorArgs, options);
  });
});
