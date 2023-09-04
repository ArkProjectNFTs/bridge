import { useConnectors as useStarknetConnectors } from "@starknet-react/core";
import { useDisconnect as useEthereumDisconnect } from "wagmi";

import { type Chain } from "../_types";

export default function useDisconnectFromChain(chain: Chain) {
  const { disconnect: ethereumDisconnect } = useEthereumDisconnect();

  const { disconnect: starknetDisconnect } = useStarknetConnectors();

  const accountValuesByChain = {
    Ethereum: {
      disconnect() {
        ethereumDisconnect();
      },
    },
    Starknet: {
      disconnect() {
        starknetDisconnect();
      },
    },
  };

  return {
    disconnect: accountValuesByChain[chain].disconnect,
  };
}
