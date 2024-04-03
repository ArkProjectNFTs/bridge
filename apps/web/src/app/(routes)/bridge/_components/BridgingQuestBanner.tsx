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
        "flex max-h-[14.5rem] items-center justify-between overflow-hidden rounded-2xl bg-galaxy-blue pl-6 text-white"
      )}
    >
      <div className="flex flex-col items-start gap-4 text-left">
        <Typography component="h4" variant="heading_light_m">
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
          className="flex h-[2.625rem] items-center justify-center rounded-full bg-space-blue-source px-6 text-white"
          href="/"
        >
          <Typography variant="button_text_s">View quests</Typography>
        </a>
      </div>
      <Image
        alt="Bridging Quest"
        className="h-80 w-auto"
        height={508}
        src="/medias/bridging_quest_illustration.png"
        width={897}
      />
    </div>
  );
}
