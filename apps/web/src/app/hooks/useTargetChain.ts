import { useLocalStorage } from "usehooks-ts";

import { type Chain } from "../helpers";

export default function useTargetChain() {
  const [targetChain, setTargetChain] = useLocalStorage<Chain>(
    "chain",
    "Ethereum"
  );

  return { setTargetChain, targetChain };
}
