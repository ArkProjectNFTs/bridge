"use client";

import {
  type Chain,
  goerli as starknetGoerli,
  // mainnet as starknetMainnet,
} from "@starknet-react/chains";
import { StarknetConfig, jsonRpcProvider } from "@starknet-react/core";
import { ThemeProvider } from "next-themes";
import { WagmiProvider, createConfig, http } from "wagmi";
import { goerli } from "wagmi/chains";

import {
  ethereumConnectors,
  starknetConnectors,
} from "../_lib/utils/connectors";

const wagmiConfig = createConfig({
  chains: [goerli],
  connectors: ethereumConnectors,
  transports: {
    [goerli.id]: http(),
  },
});

function starknetRpc(chain: Chain) {
  if (chain.network === "goerli")
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
      // provider={jsonRpcProvider({ rpc: starknetRpc })}
      provider={jsonRpcProvider({ rpc: starknetRpc })}
    >
      <WagmiProvider config={wagmiConfig}>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </WagmiProvider>
    </StarknetConfig>
  );
}
