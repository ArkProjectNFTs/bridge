import { useConnect as useStarknetConnect } from "@starknet-react/core";
import { useConnect as useEthereumConnect } from "wagmi";

import { type Chain } from "../_types";

export default function useConnectFromChain(chain: Chain) {
  const { connect: ethereumConnect, connectors: ethereumConnectors } =
    useEthereumConnect();

  const { connect: starknetConnect, connectors: starknetConnectors } =
    useStarknetConnect();

  const accountValuesByChain = {
    Ethereum: {
      connectors: ethereumConnectors.map((connector) => {
        {
          return {
            connect() {
              ethereumConnect({ connector });
            },
            id: connector.id,
          };
        }
      }),
    },
    Starknet: {
      connectors: starknetConnectors.map((connector) => {
        {
          return {
            connect() {
              starknetConnect({ connector });
            },
            // eslint-disable-next-line @typescript-eslint/unbound-method
            id: connector.id,
          };
        }
      }),
    },
  };

  return {
    connectors: accountValuesByChain[chain].connectors,
  };
}
