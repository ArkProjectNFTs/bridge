"use client";

import "~/styles/globals.css";

import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import { InjectedConnector, StarknetConfig } from "@starknet-react/core";
import { publicProvider } from "wagmi/providers/public";
import { useLocalStorage } from "usehooks-ts";
import localFont from "next/font/local";

import Footer from "./components/Footer";
import Header from "./components/Header";
import { api } from "~/utils/api";
import { type Chain } from "./helpers";

// TODO @YohanTz: Handle wallet connect and coinbase wallet connectors
// const alchemyId = process.env.ALCHEMY_ID;
// const walletConnectProjectId = process.env.WALLETCONNECT_PROJECT_ID ?? "";

const arkProjectFont = localFont({
  src: [
    {
      path: "../font/ArkProject-Light.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../font/ArkProject-Regular.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../font/ArkProject-Medium.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../font/ArkProject-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../font/ArkProject-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-ark-project",
});

const styreneAFont = localFont({
  src: [
    {
      path: "../font/StyreneA-Regular-Web.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../font/StyreneA-RegularItalic-Web.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../font/StyreneA-Bold-Web.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-styrene-a",
});

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
  const [targetChain] = useLocalStorage<Chain>("chain", "Ethereum");

  return (
    <html
      lang="en"
      className={`[color-scheme:light] ${arkProjectFont.variable} ${styreneAFont.variable} `}
    >
      <body
        className={`min-h-screen bg-neutral-50 text-sky-950 ${targetChain}`}
      >
        <StarknetConfig connectors={starknetConnectors} autoConnect>
          <WagmiConfig config={wagmiConfig}>
            <Header />
            {children}
            <Footer />
          </WagmiConfig>
        </StarknetConfig>
      </body>
    </html>
  );
}

export default api.withTRPC(RootLayout);
