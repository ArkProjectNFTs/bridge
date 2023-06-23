"use client";

import { Typography } from "design-system";
import Image from "next/image";
import { useState } from "react";

import ConnectModal from "../bridge/components/ConnectModal";

export default function ConnectWalletsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openModal() {
    setIsModalOpen(true);
  }

  return (
    <>
      <button
        className="mx-auto mb-23 mt-12 flex items-center gap-2.5 rounded-full bg-dark-blue-950 px-6 py-5"
        onClick={openModal}
      >
        <Image
          alt="wallet icon"
          height={32}
          src="/icons/wallet_small.svg"
          width={32}
        />
        <Typography className="text-white" variant="body_text_bold_16">
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
