import { InjectedConnector as InjectedEthereumConnector } from "wagmi/connectors/injected";
// import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";

import { InjectedConnector as InjectedStarknetConnector } from "@starknet-react/core";

/*
 * TODO @YohanTz: Handle Wallet Connect
 * const walletConnectProjectId = process.env.WALLETCONNECT_PROJECT_ID ?? "";
 */

export const ethereumConnectors = [
  new InjectedEthereumConnector(),
  //   new WalletConnectConnector({ options: { projectId: walletConnectProjectId } }),
  new CoinbaseWalletConnector({
    // TODO @YohanTz: handle `darkMode` for coinbase wallet modal
    options: { appName: "Starklane" /* darkMode: true */ },
  }),
];

export const starknetConnectors = [
  new InjectedStarknetConnector({ options: { id: "braavos" } }),
  new InjectedStarknetConnector({ options: { id: "argentX" } }),
];
