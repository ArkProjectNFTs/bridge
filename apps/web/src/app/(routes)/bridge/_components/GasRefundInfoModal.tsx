"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Typography,
} from "design-system";
import { useState } from "react";

export default function GasRefundInfoModal() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger onClick={() => setOpen(true)}>
        <b className="underline">More</b>
      </DialogTrigger>
      <DialogContent className="flex max-w-md flex-col gap-6">
        <Typography
          className="mt-12 text-center"
          component="h3"
          variant="heading_light_m"
        >
          How do gas fee
          <br />
          refunds work?
        </Typography>
        <Typography component="p" variant="body_text_18">
          The first <b>1000 holders</b> who bridge Everai to Starknet are
          eligible for refunds.
          <br />
          <br /> Each of these holders can receive a refund of up to <b>$40</b>.
          <br />
          <br />
          The refund will be made in <b>STRK</b> directly to your Starknet
          wallet.
        </Typography>
        <Button color="default" onClick={() => setOpen(false)} size="small">
          Got it!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
