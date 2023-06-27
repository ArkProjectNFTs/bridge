import { type StaticImageData } from "next/image";

import argentXLogo from "../../public/logos/argentX.png";
import braavosLogo from "../../public/logos/braavos.png";
import coinbaseLogo from "../../public/logos/coinbase_wallet.png";
import metaMaskLogo from "../../public/logos/metamask.png";
import walletConnectLogo from "../../public/logos/wallet_connect.png";

export type Chain = "Ethereum" | "Starknet";

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

// TODO @YohanTz: An injected connector may not be Metamask
export const CONNECTOR_LABELS_BY_ID: Record<string, string> = {
  argentX: "Argent X",
  braavos: "Braavos",
  coinbaseWallet: "Coinbase Wallet",
  injected: "Metamask",
  walletConnect: "WalletConnect",
};
