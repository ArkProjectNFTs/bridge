"use client";

import "~/styles/globals.css";

import { WagmiConfig, createConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { InjectedConnector, StarknetConfig } from "@starknet-react/core";

import Footer from "./components/Footer";
import Header from "./components/Header";
import { api } from "~/utils/api";

const alchemyId = process.env.ALCHEMY_ID;
const walletConnectProjectId = process.env.WALLETCONNECT_PROJECT_ID || "";
const chains = [goerli];

const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Your App Name",
    alchemyId,
    walletConnectProjectId,
    chains,
  })
);

const connectors = [
  new InjectedConnector({ options: { id: "braavos" } }),
  new InjectedConnector({ options: { id: "argentX" } }),
];

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="[color-scheme:light]">
      <head />
      <body className="min-h-screen bg-neutral-50 text-sky-950">
        <StarknetConfig connectors={connectors} autoConnect>
          <WagmiConfig config={wagmiConfig}>
            <ConnectKitProvider>
              <Header />
              {children}
              <Footer />
            </ConnectKitProvider>
          </WagmiConfig>
        </StarknetConfig>
      </body>
    </html>
  );
}

export default api.withTRPC(RootLayout);
