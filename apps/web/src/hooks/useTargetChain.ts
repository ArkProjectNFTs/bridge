import { useLocalStorage } from "usehooks-ts";

import { type Chain } from "../app/helpers";

export default function useTargetChain() {
  const [targetChain, setTargetChain] = useLocalStorage<Chain>(
    "chain",
    "Ethereum"
  );

  function toggle() {
    setTargetChain(targetChain === "Ethereum" ? "Starknet" : "Ethereum");
  }

  return { setTargetChain, targetChain, toggle };
}
