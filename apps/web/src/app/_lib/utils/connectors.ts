import { InjectedConnector as InjectedStarknetConnector } from "@starknet-react/core";
import { type StaticImageData } from "next/image";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

import argentXLogo from "../../../../public/logos/argentX.png";
import braavosLogo from "../../../../public/logos/braavos.png";
import coinbaseLogo from "../../../../public/logos/coinbase_wallet.png";
import metaMaskLogo from "../../../../public/logos/metamask.png";
import walletConnectLogo from "../../../../public/logos/wallet_connect.png";
import { type Chain } from "../../_types";

export const ethereumConnectors = [
  injected(),
  coinbaseWallet({
    appName: "Arklane",
    darkMode: true,
  }),
  walletConnect({
    projectId: "834a150924b84c5bac21ad1e5a32d40d",
  }),
];

export const DOWNLOAD_LINK_BY_CONNECTOR_ID: Record<string, string> = {
  argentX: "https://www.argent.xyz/argent-x/",
  braavos: "https://braavos.app/download-braavos-wallet/",
};

export const starknetConnectors = [
  new InjectedStarknetConnector({
    options: { id: "braavos", name: "Braavos" },
  }),
  new InjectedStarknetConnector({
    options: { id: "argentX", name: "Argent X" },
  }),
];

export const DEFAULT_ETHEREUM_CONNECTOR_LOGO = metaMaskLogo;
export const DEFAULT_STARKNET_CONNECTOR_LOGO = argentXLogo;

export const WALLET_LOGOS_BY_ID: Record<string, StaticImageData> = {
  argentX: argentXLogo,
  braavos: braavosLogo,
  coinbaseWallet: coinbaseLogo,
  coinbaseWalletSDK: coinbaseLogo,
  injected: metaMaskLogo,
  "io.metamask": metaMaskLogo,
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
  coinbaseWalletSDK: "Coinbase Wallet",
  injected: "Metamask",
  walletConnect: "WalletConnect",
};
