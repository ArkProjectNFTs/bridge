import { Typography } from "design-system";
import Image from "next/image";

import { useIsSSR } from "~/hooks/useIsSSR";
import useTargetChain from "~/hooks/useTargetChain";

import { CHAIN_LOGOS_BY_NAME } from "../../helpers";
import TargetChainButton from "./TargetChainButton";

export default function TargetChainSwitch() {
  const { setTargetChain, targetChain } = useTargetChain();
  const isSSR = useIsSSR();

  return (
    <div className=" my-8 inline-flex gap-0.5">
      <button
        className={`flex items-center gap-2 rounded-l-2xl py-4 pl-3 pr-6 ${
          !isSSR && targetChain === "Ethereum"
            ? "bg-primary-100 dark:bg-primary-400"
            : "bg-neutral-200 dark:bg-dark-blue-950"
        }`}
        onClick={() => setTargetChain("Ethereum")}
      >
        <Image
          alt={`Ethereum logo`}
          height={32}
          src={CHAIN_LOGOS_BY_NAME.Ethereum}
          width={32}
        />
        <Typography variant="body_text_bold_14">Ethereum</Typography>
      </button>
      <TargetChainButton orientation="horizontal" />
      <button
        className={`flex items-center gap-2 rounded-r-2xl py-4 pl-6 pr-3 ${
          !isSSR && targetChain === "Starknet"
            ? "bg-primary-100 dark:bg-primary-400"
            : "bg-neutral-200 dark:bg-dark-blue-950"
        }`}
        onClick={() => setTargetChain("Starknet")}
      >
        <Typography variant="body_text_bold_14">Starknet</Typography>
        <Image
          alt={`Starknet logo`}
          height={32}
          src={CHAIN_LOGOS_BY_NAME.Starknet}
          width={32}
        />
      </button>
    </div>
  );
}
