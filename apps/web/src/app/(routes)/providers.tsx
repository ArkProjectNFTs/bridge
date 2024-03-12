"use client";

import {
  // type Chain,
  goerli as starknetGoerli,
  // mainnet as starknetMainnet,
} from "@starknet-react/chains";
import {
  StarknetConfig,
  // jsonRpcProvider,
  publicProvider,
} from "@starknet-react/core";
import { ThemeProvider } from "next-themes";
import { WagmiProvider, createConfig, http } from "wagmi";
import { goerli } from "wagmi/chains";

import { WalletModalsProvider } from "../_components/WalletModals/WalletModalsContext";
import {
  ethereumConnectors,
  starknetConnectors,
} from "../_lib/utils/connectors";

const wagmiConfig = createConfig({
  chains: [goerli],
  connectors: ethereumConnectors,
  ssr: true,
  transports: {
    [goerli.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_ETHEREUM_RPC_ENDPOINT ?? ""
    ),
  },
});

// function starknetRpc(chain: Chain) {
//   if (chain.network === "goerli")
//     return { nodeUrl: `https://juno.testnet.arkproject.dev/` };

//   return { nodeUrl: `https://juno.mainnet.arkproject.dev/` };
// }

const starknetProvider = publicProvider();

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
      // provider={jsonRpcProvider({ rpc: starknetRpc })}
      provider={starknetProvider}
    >
      <WagmiProvider config={wagmiConfig}>
        <WalletModalsProvider>
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </WalletModalsProvider>
      </WagmiProvider>
    </StarknetConfig>
  );
}
