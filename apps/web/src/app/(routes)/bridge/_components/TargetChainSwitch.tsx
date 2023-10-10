import { Typography } from "design-system";
import Image from "next/image";

import useCurrentChain from "~/app/_hooks/useCurrentChain";

import { CHAIN_LOGOS_BY_NAME } from "../../../_lib/utils/connectors";
import TargetChainButton from "./TargetChainButton";

export default function TargetChainSwitch() {
  const { sourceChain, targetChain } = useCurrentChain();

  return (
    <div className=" my-8 inline-flex gap-0.5">
      <div
        className={`flex w-40 items-center gap-2 rounded-l-2xl bg-white py-4 pl-4 pr-8 dark:bg-space-blue-800`}
      >
        <Image
          alt={`${sourceChain} logo`}
          height={32}
          src={CHAIN_LOGOS_BY_NAME[sourceChain]}
          width={32}
        />
        <div className="flex flex-col items-start text-left">
          <Typography
            className="rounded bg-dark-blue-100 p-1 dark:bg-space-blue-300 dark:text-space-blue-900"
            component="p"
            variant="body_text_12"
          >
            From
          </Typography>

          <Typography variant="button_text_s">{sourceChain}</Typography>
        </div>
      </div>

      <TargetChainButton />

      <div className="flex w-40 items-center gap-2 rounded-r-2xl bg-white py-4 pl-8 pr-4 dark:bg-space-blue-800">
        <div className="flex flex-col items-start text-left">
          <Typography
            className="rounded bg-dark-blue-100 p-1 dark:bg-space-blue-300 dark:text-space-blue-900"
            component="p"
            variant="body_text_12"
          >
            To
          </Typography>
          <Typography variant="button_text_s">{targetChain}</Typography>
        </div>

        <Image
          alt={`${targetChain} logo`}
          height={32}
          src={CHAIN_LOGOS_BY_NAME[targetChain]}
          width={32}
        />
      </div>
    </div>
  );
}
