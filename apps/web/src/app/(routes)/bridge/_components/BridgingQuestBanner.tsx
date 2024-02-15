"use client";

import clsx from "clsx";
import { Typography } from "design-system";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface BridgingQuestBanner {
  className?: string;
}

export default function BridgingQuestBanner({
  className,
}: BridgingQuestBanner) {
  const pathname = usePathname();

  if (pathname !== "/bridge") {
    return null;
  }

  return (
    <div
      className={clsx(className, "rounded-2xl bg-galaxy-blue pt-4 text-white ")}
    >
      <div className="flex flex-col gap-4 px-4">
        <Typography component="h4" variant="heading_light_xs">
          Everai Bridging Quests
        </Typography>
        <Typography
          className="text-asteroid-grey-200"
          component="p"
          variant="body_text_14"
        >
          Bridge Everai NFTs and enter the competition by completing the
          ArkProject missions.
        </Typography>
      </div>
      <Image
        alt="Bridging Quest"
        className="w-full"
        height={508}
        src="/medias/bridging_quest_illustration.png"
        width={897}
      />
    </div>
  );
}
