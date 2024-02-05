"use client";

import { useLocalStorage } from "usehooks-ts";

import { type Chain } from "../_types";

export default function useCurrentChain() {
  const [sourceChain, setSourceChain] = useLocalStorage<Chain>(
    "chain",
    "Ethereum"
  );

  const targetChain: Chain =
    sourceChain === "Ethereum" ? "Starknet" : "Ethereum";

  function setTargetChain(chain: Chain) {
    setSourceChain(chain === "Ethereum" ? "Starknet" : "Ethereum");
  }

  function toggle() {
    setSourceChain(sourceChain === "Ethereum" ? "Starknet" : "Ethereum");
  }

  return { setSourceChain, setTargetChain, sourceChain, targetChain, toggle };
}
