"use client";

import {
  mainnet as starknetMainnet,
  sepolia as starknetSepolia,
} from "@starknet-react/chains";
import { StarknetConfig, jsonRpcProvider } from "@starknet-react/core";
import { ThemeProvider } from "next-themes";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

import { WalletModalsProvider } from "../_components/WalletModals/WalletModalsContext";
import {
  ethereumConnectors,
  starknetConnectors,
} from "../_lib/utils/connectors";

const starknetChain =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "dev"
    ? starknetSepolia
    : starknetMainnet;

const wagmiChain =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? sepolia : mainnet;

const wagmiConfig = createConfig({
  chains: [wagmiChain],
  connectors: ethereumConnectors,
  ssr: true,
  transports: {
    [mainnet.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_ETHEREUM_RPC_ENDPOINT ?? ""
    ),
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_ETHEREUM_RPC_ENDPOINT ?? ""
    ),
  },
});

function starknetRpc() {
  return {
    nodeUrl: process.env.NEXT_PUBLIC_ALCHEMY_STARKNET_RPC_ENDPOINT ?? "",
  };
}

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <StarknetConfig
      autoConnect
      chains={[starknetChain]}
      connectors={starknetConnectors}
      provider={jsonRpcProvider({ rpc: starknetRpc })}
    >
      <WagmiProvider config={wagmiConfig}>
        <WalletModalsProvider>
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </WalletModalsProvider>
      </WagmiProvider>
    </StarknetConfig>
  );
}
