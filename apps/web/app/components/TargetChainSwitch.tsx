import * as Switch from "@radix-ui/react-switch";
import { useState } from "react";
import Image from "next/image";

import ethereumLogo from "~/public/ethereum_logo.svg";
import starknetLogo from "~/public/starknet_logo.svg";

const chains = [
  { name: "Ethereum", id: "ethereum", logoSrc: ethereumLogo },
  { name: "Starknet", id: "starknet", logoSrc: starknetLogo },
] as const;

export default function TargetChainSwitch() {
  const [targetChain, setTargetChain] = useState<"ethereum" | "starknet">(
    chains[0].id
  );

  return (
    <div className=" my-4 inline-flex gap-x-1 rounded-full bg-neutral-800">
      {chains.map((chain) => {
        return (
          <button
            key={chain.id}
            onClick={() => setTargetChain(chain.id)}
            className={`flex items-center gap-2 rounded-full py-3 pl-3 pr-6 ${
              targetChain === chain.id ? "bg-violet-600" : ""
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
