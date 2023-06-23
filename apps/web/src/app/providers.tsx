"use client";

import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import {
  InjectedConnector as InjectedStarknetConnector,
  StarknetConfig,
} from "@starknet-react/core";
import { publicProvider } from "wagmi/providers/public";
import { ThemeProvider } from "next-themes";
import { ethereumConnectors, starknetConnectors } from "./connectors";

const { publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: ethereumConnectors,
});

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <StarknetConfig connectors={starknetConnectors} autoConnect>
      <WagmiConfig config={wagmiConfig}>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </WagmiConfig>
    </StarknetConfig>
  );
}
