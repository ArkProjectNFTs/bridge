"use client";

import "~/styles/globals.css";

import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import { InjectedConnector, StarknetConfig } from "@starknet-react/core";
import { publicProvider } from "wagmi/providers/public";

import Footer from "./components/Footer";
import Header from "./components/Header";
import { api } from "~/utils/api";

// TODO @YohanTz: Handle wallet connect and coinbase wallet connectors
// const alchemyId = process.env.ALCHEMY_ID;
// const walletConnectProjectId = process.env.WALLETCONNECT_PROJECT_ID ?? "";

const { publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()]
);

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

const starknetConnectors = [
  new InjectedConnector({ options: { id: "braavos" } }),
  new InjectedConnector({ options: { id: "argentX" } }),
];

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="[color-scheme:light]">
      <head />
      <body className="flex min-h-screen w-screen items-center justify-center bg-neutral-50 text-sky-950">
        <StarknetConfig connectors={starknetConnectors} autoConnect>
          <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
        </StarknetConfig>
      </body>
    </html>
  );
}

export default api.withTRPC(RootLayout);
