"use client";

import { Typography } from "design-system";

import { useConnectModals } from "./WalletModals/WalletModalsContext";

export default function ConnectWalletsButton() {
  const { toggleConnectWalletsModal } = useConnectModals();

  return (
    <>
      <button
        className="mx-auto flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-space-blue-source px-9 dark:bg-space-blue-source sm:w-auto"
        onClick={toggleConnectWalletsModal}
      >
        <Typography
          className="text-white dark:text-black"
          variant="button_text_l"
        >
          Start now
        </Typography>
      </button>
    </>
  );
}
