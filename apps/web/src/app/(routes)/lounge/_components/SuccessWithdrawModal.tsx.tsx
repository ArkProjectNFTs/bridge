"use client";

import { Button, Dialog, DialogContent, Typography } from "design-system";

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
        <div>
          <Typography
            className="mt-2 text-center"
            component="p"
            variant="heading_light_xs"
          >
            Congratulations your Everai(s) are coming back to Ethereum!
          </Typography>
          <Button className="mt-7 w-full" color="default" size="small">
            View on my Portfolio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
