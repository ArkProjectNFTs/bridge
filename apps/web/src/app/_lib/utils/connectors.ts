import { InjectedConnector as InjectedStarknetConnector } from "@starknet-react/core";
import { type StaticImageData } from "next/image";
// import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector as InjectedEthereumConnector } from "wagmi/connectors/injected";

import argentXLogo from "../../../../public/logos/argentX.png";
import braavosLogo from "../../../../public/logos/braavos.png";
import coinbaseLogo from "../../../../public/logos/coinbase_wallet.png";
import metaMaskLogo from "../../../../public/logos/metamask.png";
import walletConnectLogo from "../../../../public/logos/wallet_connect.png";
import { type Chain } from "../../_types";

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

export const DEFAULT_ETHEREUM_CONNECTOR_LOGO = metaMaskLogo;
export const DEFAULT_STARKNET_CONNECTOR_LOGO = argentXLogo;

export const WALLET_LOGOS_BY_ID: Record<string, StaticImageData> = {
  argentX: argentXLogo,
  braavos: braavosLogo,
  coinbaseWallet: coinbaseLogo,
  injected: metaMaskLogo,
  walletConnect: walletConnectLogo,
};

// export const CHAIN_LOGOS_BY_NAME: Record<Chain, StaticImageData> = {
export const CHAIN_LOGOS_BY_NAME: Record<Chain, string> = {
  Ethereum: "/logos/ethereum.svg",
  Starknet: "/logos/starknet.svg",
};

export const CHAIN_WALLET_ILLUSTRATION_BY_NAME: Record<Chain, string> = {
  Ethereum: "/medias/ethereum_wallet.png",
  Starknet: "/medias/starknet_wallet.png",
};

// TODO @YohanTz: An injected connector may not be Metamask
export const CONNECTOR_LABELS_BY_ID: Record<string, string> = {
  argentX: "Argent X",
  braavos: "Braavos",
  coinbaseWallet: "Coinbase Wallet",
  injected: "Metamask",
  walletConnect: "WalletConnect",
};
