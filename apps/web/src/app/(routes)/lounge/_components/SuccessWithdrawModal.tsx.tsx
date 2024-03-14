"use client";

import { Dialog, DialogContent, Typography } from "design-system";
import Link from "next/link";

interface SuccessWithdrawModalProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export default function SuccessWithdrawModal({
  onOpenChange,
  open,
}: SuccessWithdrawModalProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        {/* <div> */}
        <Typography
          className="mt-2 text-center"
          component="p"
          variant="heading_light_xs"
        >
          Congratulations your Everai(s) are coming back to Ethereum!
        </Typography>
        <Link
          className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-galaxy-blue px-6 py-3 text-center hover:bg-space-blue-700 dark:bg-space-blue-400 dark:hover:bg-space-blue-200"
          color="default"
          href="/portfolio"
        >
          <Typography
            className="text-white dark:text-space-blue-900"
            variant="button_text_s"
          >
            View on my Portfolio
          </Typography>
        </Link>
        {/* </div> */}
      </DialogContent>
    </Dialog>
  );
}
