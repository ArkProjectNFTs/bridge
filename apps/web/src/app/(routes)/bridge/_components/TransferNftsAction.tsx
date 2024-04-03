import useCurrentChain from "~/app/_hooks/useCurrentChain";

import TransferEthereumNftsAction from "./TransferEthereumNftsAction";
import TransferStarknetNftsAction from "./TransferStarknetNftsAction";

export default function TransferNftsAction() {
  const { sourceChain } = useCurrentChain();

  if (sourceChain === "Ethereum") {
    return <TransferEthereumNftsAction />;
  }

  return <TransferStarknetNftsAction />;
}
