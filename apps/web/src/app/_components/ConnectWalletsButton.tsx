"use client";

import { Typography } from "design-system";
import Image from "next/image";
import { useState } from "react";

import ConnectModal from "./ConnectModal";

export default function ConnectWalletsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openModal() {
    setIsModalOpen(true);
  }

  return (
    <>
      <button
        className="mx-auto mb-10.5 mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-dark-blue-950 py-3.5 dark:bg-primary-400 sm:mb-23 sm:mt-12 sm:w-auto sm:px-6 sm:py-5"
        onClick={openModal}
      >
        <Image
          alt="wallet icon"
          className="h-[24px] w-auto sm:h-[32px]"
          height={32}
          src="/icons/wallet_small.svg"
          width={32}
        />
        <Typography className="text-white" variant="button_text_l">
          Connect wallets
        </Typography>
      </button>
      <ConnectModal
        isOpen={isModalOpen}
        // key used to reset the internal states of ConnectModal when isModalOpen changes
        key={isModalOpen ? "open" : "closed"}
        onOpenChange={(open) => setIsModalOpen(open)}
      />
    </>
  );
}
