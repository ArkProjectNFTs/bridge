"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Typography,
} from "design-system";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BridgingQuestBanner from "../../bridge/_components/BridgingQuestBanner";
import clsx from "clsx";
import Image from "next/image";

interface EveraiCardProps {
  className?: string;
}

function EveraiCard({ className }: EveraiCardProps) {
  return (
    <div
      className={clsx(
        className,
        "w-40 rounded-xl border border-space-blue-600 bg-space-blue-900 p-2.5"
      )}
    >
      <Image
        height={140}
        width={140}
        src="/medias/everai_congrats.png"
        className="mb-2 w-full rounded-md"
        alt="Success Everai"
      />
      <div className="flex items-center gap-2">
        <svg
          className="flex-shrink-0"
          width="34"
          height="34"
          viewBox="0 0 34 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="16.9152"
            cy="16.9152"
            r="15.6257"
            transform="rotate(-1.35673 16.9152 16.9152)"
            fill="#1E3D54"
            stroke="#071117"
            stroke-width="0.748603"
          />
          <path
            d="M14.2101 21.0301L7.8239 16.7907L14.0028 12.278L10.8781 16.7184L14.2101 21.0301ZM18.928 20.9184L22.0024 16.4549L18.7207 12.1663L25.1311 16.3808L18.928 20.9184Z"
            fill="#FFFF80"
          />
          <path
            d="M16.2303 8.77053L10.8689 12.6557L16.1584 5.73626L21.7697 12.3976L16.2303 8.77053Z"
            fill="#FFFF80"
          />
          <path
            d="M16.602 24.4622L11.0626 20.8352L16.6738 27.4965L21.9634 20.577L16.602 24.4622Z"
            fill="#FFFF80"
          />
          <path
            d="M16.3059 12.047L13.3757 16.6838L16.5226 21.1993L19.5213 16.5383L16.3059 12.047Z"
            fill="#FFFF80"
          />
        </svg>
        <div className="text-space-blue-200">
          <Typography variant="heading_light_s" component="p">
            123
          </Typography>
          <Typography variant="body_text_12" className="text-[11px]">
            Everais bridged
          </Typography>
        </div>
      </div>
    </div>
  );
}

function EveraiCards() {
  return (
    <div className="relative flex-shrink-0">
      <EveraiCard className="mx-5 my-3 rotate-12" />
      <EveraiCard className="absolute inset-0 mx-5 my-3" />
    </div>
  );
}

interface CongratsModalProps {
  isFromTransfer: boolean;
}

export default function CongratsModal({ isFromTransfer }: CongratsModalProps) {
  const [open, setOpen] = useState(isFromTransfer);

  const router = useRouter();

  useEffect(() => {
    router.push("/lounge");
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <div className="flex items-center gap-4">
          <EveraiCards />
          <div className="flex flex-col items-start">
            <Typography component={DialogTitle} variant="heading_light_s">
              Congratulations!
            </Typography>
            <Typography
              component={DialogDescription}
              variant="body_text_16"
              className="mt-4"
            >
              Your Everais have joined 123 others Everais on Starknet and you
              completed the quest “Bridge 1 Everai Nft” on ArkProject Missions.
            </Typography>
            <a className="mt-6 flex h-12 items-center rounded-full bg-space-blue-source px-5 text-white">
              <Typography variant="button_text_s">Share on </Typography>
              <svg
                className="ml-2.5"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M15.2706 1.58659H18.0818L11.9401 8.60617L19.1654 18.1582H13.5081L9.07706 12.365L4.00699 18.1582H1.19406L7.76323 10.65L0.832031 1.58659H6.63296L10.6382 6.88187L15.2706 1.58659ZM14.284 16.4756H15.8417L5.78653 3.18087H4.11492L14.284 16.4756Z"
                  fill="white"
                />
              </svg>
            </a>
          </div>
        </div>
        <Typography className="mt-9" variant="heading_light_xs">
          Check the collection on Starknet marketplaces
        </Typography>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <a
            className="flex h-14 items-center justify-between rounded-xl border border-galaxy-blue pl-2 pr-4"
            href="/"
          >
            test
            <Image src="/icons/arrow.svg" height={24} width={24} alt="go" />
          </a>
          <a
            className="flex h-14 items-center justify-between rounded-xl border border-galaxy-blue pl-2 pr-4"
            href="/"
          >
            test
            <Image src="/icons/arrow.svg" height={24} width={24} alt="go" />
          </a>
          <a
            className="flex h-14 items-center justify-between rounded-xl border border-galaxy-blue pl-2 pr-4"
            href="/"
          >
            test
            <Image src="/icons/arrow.svg" height={24} width={24} alt="go" />
          </a>
          <a
            className="flex h-14 items-center justify-between rounded-xl border border-galaxy-blue pl-2 pr-4"
            href="/"
          >
            test
            <Image src="/icons/arrow.svg" height={24} width={24} alt="go" />
          </a>
        </div>

        <BridgingQuestBanner className="mt-2 h-48 overflow-hidden" />
      </DialogContent>
    </Dialog>
  );
}
