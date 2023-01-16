'use client';

import '#/styles/globals.css';

import { WagmiConfig, createClient } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { ConnectKitProvider, getDefaultClient } from 'connectkit';
import { InjectedConnector, StarknetConfig } from '@starknet-react/core';

import Header from '#/ui/Header';
import Footer from '#/ui/Footer';

const alchemyId = process.env.ALCHEMY_ID;
const chains = [goerli];

const wagmiClient = createClient(
  getDefaultClient({
    appName: 'Your App Name',
    alchemyId,
    chains,
  }),
);

const connectors = [
  new InjectedConnector({ options: { id: 'braavos' } }),
  new InjectedConnector({ options: { id: 'argentX' } }),
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="[color-scheme:light]">
      <head />
      <body className="min-h-screen">
        <StarknetConfig connectors={connectors} autoConnect>
          <WagmiConfig client={wagmiClient}>
            <ConnectKitProvider>
              <Header />
              <div className="">{children}</div>
              <Footer />
            </ConnectKitProvider>
          </WagmiConfig>
        </StarknetConfig>
      </body>
    </html>
  );
}
