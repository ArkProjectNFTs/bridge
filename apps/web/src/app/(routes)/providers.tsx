"use client";

import {
  mainnet as starknetMainnet,
  // sepolia as starknetSepolia,
} from "@starknet-react/chains";
import { StarknetConfig, jsonRpcProvider } from "@starknet-react/core";
import { ThemeProvider } from "next-themes";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  mainnet,
  // , sepolia
} from "wagmi/chains";

import { WalletModalsProvider } from "../_components/WalletModals/WalletModalsContext";
import {
  ethereumConnectors,
  starknetConnectors,
} from "../_lib/utils/connectors";

const wagmiConfig = createConfig({
  // chains: [sepolia],
  chains: [mainnet],
  connectors: ethereumConnectors,
  ssr: false,
  transports: {
    // [sepolia.id]: http(
    //   process.env.NEXT_PUBLIC_ALCHEMY_ETHEREUM_RPC_ENDPOINT ?? ""
    // ),
    [mainnet.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_ETHEREUM_RPC_ENDPOINT ?? ""
    ),
  },
});

function starknetRpc() {
  return {
    nodeUrl: process.env.NEXT_PUBLIC_ALCHEMY_STARKNET_RPC_ENDPOINT ?? "",
  };
}

// const starknetProvider = publicProvider();

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <StarknetConfig
      autoConnect
      // chains={[starknetSepolia]}
      chains={[starknetMainnet]}
      connectors={starknetConnectors}
      provider={jsonRpcProvider({ rpc: starknetRpc })}
      // provider={starknetProvider}
    >
      <WagmiProvider config={wagmiConfig}>
        <WalletModalsProvider>
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </WalletModalsProvider>
      </WagmiProvider>
    </StarknetConfig>
  );
}
