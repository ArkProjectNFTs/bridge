"use client";

import clsx from "clsx";
import Image from "next/image";

import useCurrentChain from "~/app/_hooks/useCurrentChain";

import { CHAIN_LOGOS_BY_NAME } from "../../../_lib/utils/connectors";

export default function ChainSwitch() {
  const { setTargetChain, targetChain } = useCurrentChain();

  return (
    <div className="mt-8 inline-flex gap-1 rounded-full border border-asteroid-grey-200 bg-asteroid-grey-100 dark:border-space-blue-600 dark:bg-space-blue-900 sm:mt-9">
      <button
        className={clsx(
          "rounded-full border-8",
          targetChain === "Ethereum"
            ? "border-primary-source"
            : "border-transparent"
        )}
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
        className={clsx(
          "rounded-full border-8",
          targetChain === "Starknet"
            ? "border-primary-source"
            : "border-transparent"
        )}
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
