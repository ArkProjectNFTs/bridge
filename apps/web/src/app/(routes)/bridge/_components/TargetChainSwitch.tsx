import { Typography } from "design-system";
import Image from "next/image";

import useCurrentChain from "~/app/_hooks/useCurrentChain";

import { CHAIN_LOGOS_BY_NAME } from "../../../_lib/utils/connectors";
import TargetChainButton from "./TargetChainButton";

export default function TargetChainSwitch() {
  const { sourceChain, targetChain } = useCurrentChain();

  return (
    <div className=" my-8 inline-flex gap-0.5">
      <div className="flex w-[12.5rem] items-center justify-between gap-2 rounded-l-2xl bg-white py-4 pl-5 pr-10 dark:bg-space-blue-800">
        <Image
          alt={`${sourceChain} logo`}
          className="rounded-full border-4 border-space-blue-50 dark:border-galaxy-blue"
          height={42}
          src={CHAIN_LOGOS_BY_NAME[sourceChain]}
          width={42}
        />
        <div className="flex flex-col items-start text-left">
          <Typography
            className="rounded bg-space-blue-100 px-1 py-0.5 text-space-blue-500 dark:bg-space-blue-300 dark:text-space-blue-900"
            component="p"
            variant="body_text_11"
          >
            From
          </Typography>

          <Typography variant="button_text_s">{sourceChain}</Typography>
        </div>
      </div>

      <TargetChainButton />

      <div className="flex w-[12.5rem] items-center justify-between gap-2 rounded-r-2xl bg-white py-4 pl-10 pr-5 dark:bg-space-blue-800">
        <div className="flex flex-col items-start text-left">
          <Typography
            className="rounded bg-space-blue-100 px-1 py-0.5 text-space-blue-500 dark:bg-space-blue-300 dark:text-space-blue-900"
            component="p"
            variant="body_text_11"
          >
            To
          </Typography>
          <Typography variant="button_text_s">{targetChain}</Typography>
        </div>

        <Image
          alt={`${targetChain} logo`}
          className="rounded-full border-4 border-space-blue-50 dark:border-galaxy-blue"
          height={42}
          src={CHAIN_LOGOS_BY_NAME[targetChain]}
          width={42}
        />
      </div>
    </div>
  );
}
