import { useDisconnect as useEthereumDisconnect } from "wagmi";
import { useConnectors as useStarknetConnectors } from "@starknet-react/core";
import { type Chain } from "../bridge/helpers";

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
      disconnect: starknetDisconnect,
    },
  };

  return {
    disconnect: accountValuesByChain[chain].disconnect,
  };
}
