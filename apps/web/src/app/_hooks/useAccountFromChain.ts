import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { useMemo } from "react";
import { useAccount as useEthereumAccount } from "wagmi";

import { type Chain } from "../_types";

export default function useAccountFromChain(chain: Chain) {
  const { address: ethereumAddress, isConnected: isEthereumConnected } =
    useEthereumAccount();

  const { address: starknetAddress, isConnected: isStarknetConnected } =
    useStarknetAccount();

  const accountValuesByChain = {
    Ethereum: { address: ethereumAddress, isConnected: isEthereumConnected },
    Starknet: {
      address: starknetAddress as `0x${string}` | undefined,
      isConnected: isStarknetConnected ?? false,
    },
  };

  const address = accountValuesByChain[chain ?? "Ethereum"].address;

  const shortAddress = useMemo(() => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  }, [address]);

  return {
    address: accountValuesByChain[chain ?? "Ethereum"].address,
    isConnected: accountValuesByChain[chain].isConnected,
    shortAddress,
  };
}
