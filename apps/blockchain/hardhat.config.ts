import { HardhatUserConfig } from "hardhat/types";
import "@shardlabs/starknet-hardhat-plugin";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

chai.use(solidity);

const {
  PRIVATE_KEY,
  GOERLI_ALCHEMY_KEY,
  HOSTNAME_L1,
  HOSTNAME_L2,
  ETHERSCAN_API_KEY,
  GOERLI_PRIVATE_KEY,
  MAINNET_ALCHEMY_KEY,
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  starknet: {
    venv: "active",
    wallets: {
      OpenZeppelin: {
        accountName: "OpenZeppelin",
        modulePath:
          "starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount",
        accountPath: "~/.starknet_accounts",
      },
    },
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${GOERLI_ALCHEMY_KEY}`,
      accounts: GOERLI_PRIVATE_KEY ? [GOERLI_PRIVATE_KEY] : [],
      chainId: 5,
    },
    l2_testnet: {
      url: `http://${HOSTNAME_L2 || "localhost"}:5050`,
    },
    l1_testnet: {
      url: `http://${HOSTNAME_L1 || "localhost"}:8545`,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
