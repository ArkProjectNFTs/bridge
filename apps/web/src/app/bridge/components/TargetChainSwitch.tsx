import Image from "next/image";
import { CHAIN_LOGOS_BY_NAME, type Chain } from "../helpers";
import { useIsSSR } from "~/hooks/useIsSSR";
import TargetChainButton from "./TargetChainButton";
import { Typography } from "design-system";

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
    <div className=" my-8 inline-flex gap-0.5">
      <button
        onClick={() => setTargetChain("Ethereum")}
        className={`flex items-center gap-2 rounded-l-2xl py-3 pl-3 pr-6 ${
          !isSSR && targetChain === "Ethereum"
            ? "bg-primary-100"
            : "bg-neutral-200"
        }`}
      >
        <Image
          src={CHAIN_LOGOS_BY_NAME.Ethereum}
          height={32}
          width={32}
          alt={`Ethereum logo`}
        />
        <Typography variant="body_text_bold_14">Ethereum</Typography>
      </button>
      <TargetChainButton orientation="horizontal" />
      <button
        onClick={() => setTargetChain("Starknet")}
        className={`flex items-center gap-2 rounded-r-2xl py-3 pl-6 pr-3 ${
          !isSSR && targetChain === "Starknet"
            ? "bg-primary-100"
            : "bg-neutral-200"
        }`}
      >
        <Typography variant="body_text_bold_14">Starknet</Typography>
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
