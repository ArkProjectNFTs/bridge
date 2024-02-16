"use client";

import clsx from "clsx";
import { Typography } from "design-system";
import Image from "next/image";

interface BridgingQuestBanner {
  className?: string;
}

export default function BridgingQuestBanner({
  className,
}: BridgingQuestBanner) {
  return (
    <div
      className={clsx(
        className,
        "flex items-center justify-between rounded-2xl bg-galaxy-blue pl-8 text-white"
      )}
    >
      <div className="flex flex-col items-start gap-4 px-4 text-left">
        <Typography component="h4" variant="heading_light_xs">
          Everai Bridging Quests
        </Typography>
        <Typography
          className="text-asteroid-grey-200"
          component="p"
          variant="body_text_14"
        >
          Bridge Everai NFTs and enter the competition by completing the first
          ArkProject quests.
        </Typography>
        <a
          className="flex h-12 items-center justify-center rounded-full bg-space-blue-source px-6 text-white"
          href="/"
        >
          <Typography variant="button_text_s">View quests</Typography>
        </a>
      </div>
      <Image
        alt="Bridging Quest"
        className="max-h-[14.5rem] w-auto"
        height={508}
        src="/medias/bridging_quest_illustration.png"
        width={897}
      />
    </div>
  );
}
