import Image from "next/image";
import { CHAIN_LOGOS_BY_NAME, type Chain } from "../helpers";

type TargetChainSwitch = {
  targetChain: Chain;
  setTargetChain: (chain: Chain) => void;
};

const chains: Array<Chain> = ["Ethereum", "Starknet"];

export default function TargetChainSwitch({
  targetChain,
  setTargetChain,
}: TargetChainSwitch) {
  return (
    <div className=" my-4 inline-flex gap-x-1 rounded-full bg-neutral-200 font-semibold">
      {chains.map((chain) => {
        return (
          <button
            key={chain}
            onClick={() => setTargetChain(chain)}
            className={`flex items-center gap-2 rounded-full py-3 pl-3 pr-6 ${
              targetChain === chain ? "bg-emerald-400 text-white" : ""
            }`}
          >
            <Image
              src={CHAIN_LOGOS_BY_NAME[chain]}
              height={32}
              width={32}
              alt={`${chain} logo`}
            />
            {chain}
          </button>
        );
      })}
    </div>
  );
}
