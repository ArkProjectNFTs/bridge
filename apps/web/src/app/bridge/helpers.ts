import argentXLogo from "../../../public/logos/argentX.png";
import braavosLogo from "../../../public/logos/braavos.png";
import ethereumLogo from "../../../public/logos/ethereum.png";
import metaMaskLogo from "../../../public/logos/metamask.png";
import starknetLogo from "../../../public/logos/starknet.png";
import { type StaticImageData } from "next/image";

export type Chain = "Ethereum" | "Starknet";

export const DEFAULT_ETHEREUM_CONNECTOR_LOGO = metaMaskLogo;
export const DEFAULT_STARKNET_CONNECTOR_LOGO = argentXLogo;

export const WALLET_LOGOS_BY_ID: Record<string, StaticImageData> = {
  braavos: braavosLogo,
  argentX: argentXLogo,
  injected: metaMaskLogo,
};

export const CHAIN_LOGOS_BY_NAME: Record<Chain, StaticImageData> = {
  Ethereum: ethereumLogo,
  Starknet: starknetLogo,
};

// TODO @YohanTz: An injected connector may not be Metamask
export const CONNECTOR_LABELS_BY_ID: Record<string, string> = {
  braavos: "Braavos",
  argentX: "Argent X",
  injected: "Metamask",
};
