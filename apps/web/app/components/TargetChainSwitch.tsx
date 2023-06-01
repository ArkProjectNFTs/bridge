import Image from "next/image";

export type Chain = "Ethereum" | "Starknet";

type TargetChainSwitch = {
  targetChain: Chain;
  setTargetChain: (chain: Chain) => void;
};

const chains: Array<{ name: Chain; logoSrc: string }> = [
  { name: "Ethereum", logoSrc: "/ethereum_logo.svg" },
  { name: "Starknet", logoSrc: "/starknet_logo.svg" },
];

export default function TargetChainSwitch({
  targetChain,
  setTargetChain,
}: TargetChainSwitch) {
  return (
    <div className=" my-4 inline-flex gap-x-1 rounded-full bg-neutral-200 font-semibold">
      {chains.map((chain) => {
        return (
          <button
            key={chain.name}
            onClick={() => setTargetChain(chain.name)}
            className={`flex items-center gap-2 rounded-full py-3 pl-3 pr-6 ${
              targetChain === chain.name ? "bg-emerald-400 text-white" : ""
            }`}
          >
            <Image
              src={chain.logoSrc}
              height={32}
              width={32}
              alt={`${chain.name} logo`}
            />
            {chain.name}
          </button>
        );
      })}
    </div>
  );
}
