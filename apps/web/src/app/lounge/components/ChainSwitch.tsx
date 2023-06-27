import Image from "next/image";

import useCurrentChain from "~/hooks/useCurrentChain";

import { CHAIN_LOGOS_BY_NAME } from "../../helpers";

export default function ChainSwitch() {
  const { setTargetChain, targetChain } = useCurrentChain();

  return (
    <div className="mt-9 inline-flex gap-1 rounded-full border border-[#d3e2e1] bg-[#e4edec] dark:border-dark-blue-600 dark:bg-dark-blue-900">
      <button
        className={`rounded-full border-8 ${
          targetChain === "Ethereum"
            ? "border-primary-300"
            : "border-transparent"
        }`}
        onClick={() => setTargetChain("Ethereum")}
      >
        <Image
          alt="Ethereum logo"
          height={30}
          src={CHAIN_LOGOS_BY_NAME.Ethereum}
          width={30}
        />
      </button>
      <button
        className={`rounded-full border-8 ${
          targetChain === "Starknet"
            ? "border-primary-300"
            : "border-transparent"
        }`}
        onClick={() => setTargetChain("Starknet")}
      >
        <Image
          alt="Ethereum logo"
          height={30}
          src={CHAIN_LOGOS_BY_NAME.Starknet}
          width={30}
        />
      </button>
    </div>
  );
}
