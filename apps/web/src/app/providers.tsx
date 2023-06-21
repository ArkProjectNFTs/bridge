"use client";

import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import { InjectedConnector, StarknetConfig } from "@starknet-react/core";
import { publicProvider } from "wagmi/providers/public";
import { ThemeProvider } from "next-themes";

const { publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()]
);

// TODO @YohanTz: Handle wallet connect and coinbase wallet connectors
// const alchemyId = process.env.ALCHEMY_ID;
// const walletConnectProjectId = process.env.WALLETCONNECT_PROJECT_ID ?? "";
const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

const starknetConnectors = [
  new InjectedConnector({ options: { id: "braavos" } }),
  new InjectedConnector({ options: { id: "argentX" } }),
];

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
