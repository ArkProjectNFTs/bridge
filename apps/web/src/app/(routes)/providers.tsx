"use client";

import { StarknetConfig } from "@starknet-react/core";
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

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <StarknetConfig autoConnect connectors={starknetConnectors}>
      <WagmiConfig config={wagmiConfig}>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </WagmiConfig>
    </StarknetConfig>
  );
}
