import { type Chain } from "~/app/_types";

import useTransferEthereumNfts from "./useTransferEthereumNfts";
import useTransferStarknetNfts from "./useTransferStarknetNfts";

export default function useTransferNftsFromChain(chain: Chain) {
  const transferEthereumNfts = useTransferEthereumNfts();
  const transferStarknetNfts = useTransferStarknetNfts();

  return chain === "Ethereum" ? transferEthereumNfts : transferStarknetNfts;
}
