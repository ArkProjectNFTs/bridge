"use client";

import clsx from "clsx";
import { Typography } from "design-system";
import Image from "next/image";

interface BridgingQuestBanner {
  className?: string;
}

export default function SmallBridgingQuestBanner({
  className,
}: BridgingQuestBanner) {
  return (
    <a
      className={clsx(
        className,
        "rounded-2xl bg-galaxy-blue pt-4 text-white dark:bg-void-black"
      )}
      href="/"
      target="_blank"
    >
      <div className="flex flex-col items-start gap-4 px-4">
        <Typography component="h4" variant="heading_light_xxs">
          Bridge your Everai NFTs and complete your first ArkProject quests.
        </Typography>
        <div className="flex h-8 items-center justify-center rounded-full bg-space-blue-source px-4 text-white">
          <Typography variant="button_text_xs">View quests</Typography>
        </div>
      </div>
      <Image
        alt="Bridging Quest"
        className="pointer-events-none mt-[-4.75rem] w-full pl-[7.125rem]"
        height={508}
        src="/medias/bridging_quest_illustration.png"
        width={897}
      />
    </a>
  );
}
