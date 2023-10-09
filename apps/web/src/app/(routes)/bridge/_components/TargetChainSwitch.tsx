import { Typography } from "design-system";
import Image from "next/image";

import useCurrentChain from "~/app/_hooks/useCurrentChain";

import { CHAIN_LOGOS_BY_NAME } from "../../../_lib/utils/connectors";
import TargetChainButton from "./TargetChainButton";

export default function TargetChainSwitch() {
  const { setTargetChain, targetChain } = useCurrentChain();

  return (
    <div className=" my-8 inline-flex gap-0.5">
      <button
        className={`flex items-center gap-2 rounded-l-2xl bg-white py-4 pl-3 pr-8`}
        onClick={() => setTargetChain("Ethereum")}
      >
        <Image
          alt={`Ethereum logo`}
          height={32}
          src={CHAIN_LOGOS_BY_NAME.Ethereum}
          width={32}
        />
        <div className="flex flex-col items-start text-left">
          <Typography
            className="rounded bg-dark-blue-100 p-1"
            component="p"
            variant="body_text_12"
          >
            From
          </Typography>

          <Typography variant="button_text_s">Ethereum</Typography>
        </div>
      </button>
      <TargetChainButton />
      <button
        className="flex items-center gap-2 rounded-r-2xl bg-white py-4 pl-8 pr-3"
        onClick={() => setTargetChain("Starknet")}
      >
        <div className="flex flex-col items-start text-left">
          <Typography
            className="rounded bg-dark-blue-100 p-1"
            component="p"
            variant="body_text_12"
          >
            To
          </Typography>
          <Typography variant="button_text_s">Starknet</Typography>
        </div>

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
