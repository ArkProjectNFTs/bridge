import argentXLogo from "~/public/argentX_logo.png";
import braavosLogo from "~/public/braavos_logo.png";
import ethereumLogo from "~/public/ethereum_logo.png";
import metaMaskLogo from "~/public/metamask_logo.png";
import starknetLogo from "~/public/starknet_logo.png";
import { type StaticImageData } from "next/image";

export type Chain = "Ethereum" | "Starknet";

export const WALLET_LOGOS_BY_ID: Record<string, StaticImageData> = {
  braavos: braavosLogo,
  argentX: argentXLogo,
  metaMask: metaMaskLogo,
};

export const CHAIN_LOGOS_BY_NAME: Record<Chain, StaticImageData> = {
  Ethereum: ethereumLogo,
  Starknet: starknetLogo,
};

export const CONNECTOR_LABELS_BY_ID: Record<string, string> = {
  braavos: "Braavos",
  argentX: "Argent X",
};
