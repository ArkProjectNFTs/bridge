"use client";

import { Dialog, DialogContent, Typography } from "design-system";
import Link from "next/link";

import Media from "~/app/_components/Media";
import { type NftMedia } from "~/server/api/types";

interface SuccessWithdrawModalProps {
  collectionMedia: NftMedia;
  collectionName: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export default function SuccessWithdrawModal({
  collectionMedia,
  collectionName,
  onOpenChange,
  open,
}: SuccessWithdrawModalProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <div className="relative">
          <Media
            alt=""
            className="mx-auto mt-2 rounded-md"
            height={106}
            media={collectionMedia}
            width={106}
          />
          <Media
            alt=""
            className="absolute inset-0 mx-auto mt-2 rotate-[-18deg] rounded-md"
            height={106}
            media={collectionMedia}
            width={106}
          />
        </div>
        <Typography
          className="mt-5 text-center"
          component="p"
          variant="heading_light_xs"
        >
          Congratulations your {collectionName}(s) are coming back to Ethereum!
        </Typography>
        <Link
          className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-galaxy-blue px-6 py-3 text-center hover:bg-space-blue-700 dark:bg-space-blue-400 dark:hover:bg-space-blue-200"
          color="default"
          href="/portfolio"
          onClick={() => onOpenChange(false)}
        >
          <Typography
            className="text-white dark:text-space-blue-900"
            variant="button_text_s"
          >
            View on my Portfolio
          </Typography>
        </Link>
      </DialogContent>
    </Dialog>
  );
}
