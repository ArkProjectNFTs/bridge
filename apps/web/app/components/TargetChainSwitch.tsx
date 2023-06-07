import Image from "next/image";
import { CHAIN_LOGOS_BY_NAME, type Chain } from "../helpers";
import { useIsSSR } from "~/hooks/useIsSSR";
import TargetChainButton from "./TargetChainButton";

type TargetChainSwitch = {
  targetChain: Chain;
  setTargetChain: (chain: Chain) => void;
};

export default function TargetChainSwitch({
  targetChain,
  setTargetChain,
}: TargetChainSwitch) {
  const isSSR = useIsSSR();

  return (
    <div className=" my-4 inline-flex gap-0.5 font-semibold">
      <button
        onClick={() => setTargetChain("Ethereum")}
        className={`flex items-center gap-2 rounded-l-2xl py-3 pl-3 pr-6 ${
          !isSSR && targetChain === "Ethereum"
            ? "bg-emerald-200"
            : "bg-neutral-200"
        }`}
      >
        <Image
          src={CHAIN_LOGOS_BY_NAME.Ethereum}
          height={32}
          width={32}
          alt={`Ethereum logo`}
        />
        Ethereum
      </button>
      <TargetChainButton orientation="horizontal" />
      <button
        onClick={() => setTargetChain("Starknet")}
        className={`flex items-center gap-2 rounded-r-2xl py-3 pl-6 pr-3 ${
          !isSSR && targetChain === "Starknet"
            ? "bg-emerald-200"
            : "bg-neutral-200"
        }`}
      >
        Starknet
        <Image
          src={CHAIN_LOGOS_BY_NAME.Starknet}
          height={32}
          width={32}
          alt={`Starknet logo`}
        />
      </button>
    </div>
  );
}
