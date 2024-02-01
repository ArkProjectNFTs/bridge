"use client";

import {
  type Chain,
  goerli as starknetGoerli,
  // mainnet as starknetMainnet,
} from "@starknet-react/chains";
import { StarknetConfig, jsonRpcProvider } from "@starknet-react/core";
import { ThemeProvider } from "next-themes";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import {
  ethereumConnectors,
  starknetConnectors,
} from "../_lib/utils/connectors";

const { publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: ethereumConnectors,
  publicClient,
  webSocketPublicClient,
});

function starknetRpc(_chain: Chain) {
  if (_chain.network === "goerli")
    return { nodeUrl: `https://juno.testnet.arkproject.dev/` };

  return { nodeUrl: `https://juno.mainnet.arkproject.dev/` };
}

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <StarknetConfig
      autoConnect
      chains={[starknetGoerli]}
      // chains={[starknetMainnet]}
      connectors={starknetConnectors}
      provider={jsonRpcProvider({ rpc: starknetRpc })}
    >
      <WagmiConfig config={wagmiConfig}>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </WagmiConfig>
    </StarknetConfig>
  );
}
