import { useConnect as useEthereumConnect } from "wagmi";
import { useConnectors as useStarknetConnect } from "@starknet-react/core";
import { type Chain } from "../bridge/helpers";
import { useEffect } from "react";

export default function useConnectFromChain(chain: Chain) {
  const { connect: ethereumConnect, connectors: ethereumConnectors } =
    useEthereumConnect();

  const {
    connect: starknetConnect,
    connectors: starknetConnectors,
    refresh: starknetRefresh,
  } = useStarknetConnect();

  useEffect(() => {
    const interval = setInterval(() => {
      if (chain === "Starknet") {
        starknetRefresh();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [starknetRefresh, chain]);

  const accountValuesByChain = {
    Ethereum: {
      connectors: ethereumConnectors.map((connector) => {
        {
          return {
            id: connector.id,
            connect() {
              ethereumConnect({ connector });
            },
          };
        }
      }),
    },
    Starknet: {
      connectors: starknetConnectors.map((connector) => {
        {
          return {
            id: connector.id(),
            connect() {
              starknetConnect(connector);
            },
          };
        }
      }),
    },
  };

  return {
    connectors: accountValuesByChain[chain].connectors,
  };
}
